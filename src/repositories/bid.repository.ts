import { FindManyOptions, SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Bid from "../entities/Bid";

// Define filter types
interface BidFilter {
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  auctionId?: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Helper function to apply common filters
const applyBidFilters = (
  queryBuilder: SelectQueryBuilder<Bid>,
  filter: Partial<BidFilter>,
) => {
  if (filter.minAmount !== undefined) {
    queryBuilder.andWhere("bid.bid_amount >= :minAmount", {
      minAmount: filter.minAmount,
    });
  }

  if (filter.maxAmount !== undefined) {
    queryBuilder.andWhere("bid.bid_amount <= :maxAmount", {
      maxAmount: filter.maxAmount,
    });
  }

  if (filter.startDate) {
    queryBuilder.andWhere("bid.bid_time >= :startDate", {
      startDate: filter.startDate,
    });
  }

  if (filter.endDate) {
    queryBuilder.andWhere("bid.bid_time <= :endDate", {
      endDate: filter.endDate,
    });
  }

  if (filter.userId) {
    queryBuilder.andWhere("user.user_id = :userId", {
      userId: filter.userId,
    });
  }

  if (filter.auctionId) {
    queryBuilder.andWhere("auction.auction_id = :auctionId", {
      auctionId: filter.auctionId,
    });
  }
};

// Helper function to apply pagination
const applyPagination = (
  queryBuilder: SelectQueryBuilder<Bid>,
  pagination?: PaginationOptions,
) => {
  if (pagination) {
    const { page = 1, limit = 10 } = pagination;
    queryBuilder.skip((page - 1) * limit).take(limit);
  }
};

// Extend the base repository with additional methods
const bidRepository = dataSource.getRepository(Bid).extend({
  async findAllAndCount(
    filter?: BidFilter,
    pagination?: PaginationOptions,
    options?: FindManyOptions<Bid>,
  ) {
    const queryBuilder = this.createQueryBuilder("bid")
      .leftJoinAndSelect("bid.auction", "auction")
      .leftJoin("bid.user", "user")
      .select(["user.user_id", "user.username"]);

    // Apply filters
    if (filter) {
      applyBidFilters(queryBuilder, filter);
    }

    // Apply pagination
    applyPagination(queryBuilder, pagination);

    // Apply additional options if provided
    if (options?.order) {
      Object.entries(options.order).forEach(([key, value]) => {
        queryBuilder.addOrderBy(`bid.${key}`, value as "ASC" | "DESC");
      });
    }

    return queryBuilder.getManyAndCount();
  },

  async findBidById(bid_id: string) {
    return this.findOne({
      where: { bid_id },
      relations: ["auction", "user"],
    });
  },

  async findBidByAuctionId(
    auction_id: string,
    filter?: Omit<BidFilter, "auctionId">,
    pagination?: PaginationOptions,
  ) {
    const queryBuilder = this.createQueryBuilder("bid")
      .leftJoinAndSelect("bid.auction", "auction")
      .leftJoinAndSelect("bid.user", "user")
      .where("auction.auction_id = :auction_id", { auction_id });

    // Apply filters
    if (filter) {
      applyBidFilters(queryBuilder, filter);
    }

    // Apply pagination
    applyPagination(queryBuilder, pagination);

    return queryBuilder.getManyAndCount();
  },

  async findBidByUserId(
    user_id: string,
    filter?: Omit<BidFilter, "userId">,
    pagination?: PaginationOptions,
  ) {
    const queryBuilder = this.createQueryBuilder("bid")
      .leftJoinAndSelect("bid.auction", "auction")
      .leftJoinAndSelect("bid.user", "user")
      .where("user.user_id = :user_id", { user_id });

    // Apply filters
    if (filter) {
      applyBidFilters(queryBuilder, filter);
    }

    // Apply pagination
    applyPagination(queryBuilder, pagination);

    return queryBuilder.getManyAndCount();
  },
});

export default bidRepository;
