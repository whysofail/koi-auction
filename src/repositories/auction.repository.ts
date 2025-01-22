import { SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Auction from "../entities/Auction";
import { IAuctionFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";

// Helper function to apply pagination
const applyPagination = (
  queryBuilder: SelectQueryBuilder<Auction>,
  pagination?: { page?: number; limit?: number },
) => {
  if (pagination) {
    const { page = 1, limit = 10 } = pagination;
    queryBuilder.skip((page - 1) * limit).take(limit);
  }
};

// Function to apply filters to the Auction query
export const applyAuctionFilters = (
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
  ) {
    const qb = this.createQueryBuilder("auction")
      .leftJoinAndSelect("auction.bids", "bids")
      .leftJoinAndSelect("auction.participants", "participants");

    // Apply filters directly using TypeORM's `where`
    applyAuctionFilters(qb, filters); // Apply filters dynamically
    applyPagination(qb, pagination); // Apply pagination

    // Fetch results with count
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
