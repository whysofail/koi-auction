import { SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Auction from "../entities/Auction";
import { IAuctionFilter } from "../types/entityfilter";
import { PaginationOptions, applyPagination } from "../utils/pagination";
import { IAuctionOrder } from "../types/entityorder.types";

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

  if (order.orderBy === "reserve_price") {
    qb.orderBy("auction.reserve_price", order.order);
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
    qb.andWhere("auction.reserve_price >= :minReservePrice", {
      minReservePrice: filters.minReservePrice,
    });
  }

  if (filters.maxReservePrice !== undefined) {
    qb.andWhere("auction.reserve_price <= :maxReservePrice", {
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
    qb.andWhere("auction.status = :status", { status: filters.status });
  }

  return qb;
};

const auctionRepository = dataSource.getRepository(Auction).extend({
  async getAllAuctions(
    filters?: IAuctionFilter,
    pagination?: PaginationOptions,
    order?: IAuctionOrder,
  ) {
    const qb = this.createQueryBuilder("auction")
      .leftJoin("auction.user", "user")
      .addSelect(["user.user_id", "user.username"]) // Select only the user_id and username fields
      .leftJoinAndSelect("auction.bids", "bids")
      .leftJoinAndSelect("auction.participants", "participants");

    applyAuctionFilters(qb, filters);
    applyAuctionOrdering(qb, order);
    applyPagination(qb, pagination);

    const [auctions, count] = await qb.getManyAndCount();
    return { auctions, count };
  },
  async findAuctionById(
    auction_id: string,
    filters?: IAuctionFilter,
    pagination?: { page?: number; limit?: number },
  ) {
    const qb = this.createQueryBuilder("auction")
      .leftJoin("auction.user", "user")
      .addSelect(["user.user_id", "user.username"]) // Select only the user_id and username fields
      .leftJoinAndSelect("auction.bids", "bids")
      .leftJoinAndSelect("auction.participants", "participants")
      // Join and select specific user fields inside participants
      .leftJoin("participants.user", "participant_user")
      .addSelect(["participant_user.user_id", "participant_user.username"]);

    // Add any additional condition for auction_id
    qb.where("auction.auction_id = :auction_id", { auction_id });
    applyAuctionFilters(qb, filters); // Apply filters dynamically
    applyPagination(qb, pagination); // Apply pagination

    // Execute the query
    const auction = await qb.getOne();

    if (auction) {
      // Use a separate query builder to count participants
      const participantsCount = await this.createQueryBuilder("auction")
        .leftJoin("auction.participants", "participants")
        .where("auction.auction_id = :auction_id", { auction_id })
        .getCount();

      // Manually add participants_count to each participant
      auction.participants = auction.participants.map((participant) => ({
        ...participant,
        count: participantsCount,
      }));
    }

    return auction;
  },

  async findAuctionWithBids(
    auction_id: string,
    filters?: IAuctionFilter,
    pagination?: { page?: number; limit?: number },
  ) {
    const qb = this.createQueryBuilder("auction")
      .leftJoinAndSelect("auction.bids", "bids")
      .where("auction.auction_id = :auction_id", { auction_id });

    applyAuctionFilters(qb, filters); // Apply filters dynamically
    applyPagination(qb, pagination); // Apply pagination

    // Await the query result
    const auction = await qb.getOne();
    return auction;
  },
});

export default auctionRepository;
