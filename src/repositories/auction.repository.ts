import { Repository, SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Auction, { AuctionStatus } from "../entities/Auction";
import { IAuctionFilter } from "../types/entityfilter";
import { PaginationOptions, applyPagination } from "../utils/pagination";
import { IAuctionOrder } from "../types/entityorder.types";
import Wishlist from "../entities/Wishlist";

const applyAuctionOrdering = (
  qb: SelectQueryBuilder<Auction>,
  order?: IAuctionOrder,
) => {
  if (!order || !order.orderBy) {
    qb.addOrderBy("auction.created_at", "DESC");
    return qb;
  }

  if (order.orderBy === "start_datetime") {
    qb.orderBy("auction.start_datetime", order.order);
  }

  if (order.orderBy === "end_datetime") {
    qb.orderBy("auction.end_datetime", order.order);
  }

  if (order.orderBy === "buynow_price") {
    qb.orderBy("auction.buynow_price", order.order);
  }

  if (order.orderBy === "created_at") {
    qb.orderBy("auction.created_at", order.order);
  }

  if (order.orderBy === "updated_at") {
    qb.orderBy("auction.updated_at", order.order);
  }

  if (order.orderBy === "current_highest_bid") {
    qb.orderBy("auction.current_highest_bid", order.order);
  }

  if (order.orderBy === "bid_starting_price") {
    qb.orderBy("auction.bid_starting_price", order.order);
  }

  if (order.orderBy === "participants_count") {
    qb.orderBy("participants_count", order.order);
  }

  return qb;
};

// Function to apply filters to the Auction query
const applyAuctionFilters = (
  qb: SelectQueryBuilder<Auction>,
  filters: IAuctionFilter = {},
) => {
  if (filters.title) {
    qb.andWhere("auction.title ILIKE :title", { title: `%${filters.title}%` });
  }

  if (filters.description) {
    qb.andWhere("auction.description ILIKE :description", {
      description: `%${filters.description}%`,
    });
  }

  if (filters.minReservePrice !== undefined) {
    qb.andWhere("auction.buynow_price >= :minReservePrice", {
      minReservePrice: filters.minReservePrice,
    });
  }

  if (filters.maxReservePrice !== undefined) {
    qb.andWhere("auction.buynow_price <= :maxReservePrice", {
      maxReservePrice: filters.maxReservePrice,
    });
  }

  if (filters.startDateFrom) {
    qb.andWhere("auction.start_datetime >= :startDateFrom", {
      startDateFrom: filters.startDateFrom,
    });
  }

  if (filters.startDateTo) {
    qb.andWhere("auction.start_datetime <= :startDateTo", {
      startDateTo: filters.startDateTo,
    });
  }

  if (filters.status) {
    qb.andWhere("auction.status IN (:...statuses)", {
      statuses: Array.isArray(filters.status)
        ? filters.status
        : [filters.status],
    });
  } else {
    qb.andWhere("auction.status != :status", { status: AuctionStatus.DELETED });
  }

  return qb;
};

const createBaseQuery = (repository: Repository<Auction>) =>
  repository
    .createQueryBuilder("auction")
    .withDeleted()
    .leftJoin("auction.user", "user")
    .addSelect(["user.user_id", "user.username"])
    .leftJoinAndSelect("auction.bids", "bids")
    .leftJoin("bids.user", "bid_user")
    .addSelect(["bid_user.user_id", "bid_user.username"])
    .leftJoinAndSelect("auction.participants", "participants")
    .leftJoin("participants.user", "participant_user")
    .orderBy("participants.joined_at", "DESC")
    .addSelect(["participant_user.user_id", "participant_user.username"]);

const auctionRepository = dataSource.getRepository(Auction).extend({
  async getAllAuctions(
    filters?: IAuctionFilter,
    pagination?: PaginationOptions,
    order?: IAuctionOrder,
    user_id?: string,
  ) {
    const qb = createBaseQuery(this);

    applyAuctionFilters(qb, filters);
    applyAuctionOrdering(qb, order);
    applyPagination(qb, pagination);

    const [auctions, count] = await qb.getManyAndCount();

    if (user_id && auctions.length > 0) {
      // Create an array of promises for parallel execution
      const wishlistPromises = auctions.map(async (auction) => {
        const wishlisted = await dataSource
          .getRepository(Wishlist)
          .createQueryBuilder("wishlist")
          .innerJoin("wishlist.auction", "auction")
          .innerJoin("wishlist.user", "user")
          .where("user.user_id = :user_id", { user_id })
          .andWhere("auction.auction_id = :auction_id", {
            auction_id: auction.auction_id,
          })
          .getOne();

        return { ...auction, hasWishlisted: !!wishlisted };
      });

      // Resolve all promises concurrently
      const updatedAuctions = await Promise.all(wishlistPromises);

      return { auctions: updatedAuctions, count };
    }

    // If no user_id, add hasWishlisted: false to all auctions
    const updatedAuctions = auctions.map((auction) => ({
      ...auction,
      hasWishlisted: false,
    }));

    return { auctions: updatedAuctions, count };
  },
  async findAuctionById(auction_id: string, user_id?: string) {
    const qb = createBaseQuery(this);
    qb.where("auction.auction_id = :auction_id", {
      auction_id,
    })
      .leftJoin("auction.winner", "winner")
      .addSelect(["winner.user_id", "winner.username"]); // Only select required fields
    // Add this line
    const auction = await qb.getOne();

    if (auction) {
      // Count participants
      const participantsCount = await this.createQueryBuilder("auction")
        .select("COUNT(participants.auction_participant_id)", "count")
        .leftJoin("auction.participants", "participants")
        .where("auction.auction_id = :auction_id", { auction_id })
        .getRawOne()
        .then((result) => Number(result.count));

      auction.participants_count = participantsCount;

      // Check if user has joined and has wishlisted the auction
      let hasJoined = false;
      let hasWishlisted = false;
      if (user_id) {
        const participant = await this.createQueryBuilder("auction")
          .leftJoin("auction.participants", "participants")
          .where("auction.auction_id = :auction_id", { auction_id })
          .andWhere("participants.user_id = :user_id", { user_id })
          .getOne();
        hasJoined = !!participant;

        const wishlisted = await dataSource
          .getRepository(Wishlist)
          .createQueryBuilder("wishlist")
          .innerJoin("wishlist.auction", "auction")
          .innerJoin("wishlist.user", "user")
          .where("user.user_id = :user_id", { user_id })
          .andWhere("auction.auction_id = :auction_id", { auction_id })
          .getOne();

        hasWishlisted = !!wishlisted;
      }

      return { ...auction, hasJoined, hasWishlisted };
    }

    return null;
  },

  async findAuctionWithBids(auction_id: string) {
    const qb = this.createQueryBuilder("auction")
      .leftJoinAndSelect("auction.bids", "bids")
      .where("auction.auction_id = :auction_id", { auction_id });

    // Await the query result
    const auction = await qb.getOne();
    return auction;
  },
});

export default auctionRepository;
