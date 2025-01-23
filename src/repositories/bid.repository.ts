import { FindManyOptions, SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Bid from "../entities/Bid";
import { IBidFilter } from "../types/entityfilter";

interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Helper function to apply common filters
const applyBidFilters = (
  queryBuilder: SelectQueryBuilder<Bid>,
  filter: Partial<IBidFilter>,
) => {
  if (filter.bidAmountMin !== undefined) {
    queryBuilder.andWhere("bid.bid_amount >= :bidAmountMin", {
      bidAmountMin: filter.bidAmountMin,
    });
  }

  if (filter.bidAmountMin !== undefined) {
    queryBuilder.andWhere("bid.bid_amount <= :bidAmountMin", {
      bidAmountMin: filter.bidAmountMin,
    });
  }

  if (filter.bidTimeFrom) {
    queryBuilder.andWhere("bid.bid_time >= :.bidTimeFrom", {
      bidTimeFrom: filter.bidTimeFrom,
    });
  }

  if (filter.bidTimeTo) {
    queryBuilder.andWhere("bid.bid_time <= :bidTimeTo", {
      bidTimeTo: filter.bidTimeTo,
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
    filter?: IBidFilter,
    pagination?: PaginationOptions,
    options?: FindManyOptions<Bid>,
  ) {
    const qb = this.createQueryBuilder("bid")
      .leftJoinAndSelect("bid.auction", "auction")
      .leftJoinAndSelect("bid.user", "user");

    // Apply filters
    if (filter) {
      applyBidFilters(qb, filter);
    }

    // Apply pagination
    applyPagination(qb, pagination);

    // Apply additional options if provided
    if (options?.order) {
      Object.entries(options.order).forEach(([key, value]) => {
        qb.addOrderBy(`bid.${key}`, value as "ASC" | "DESC");
      });
    }

    const [bids, count] = await qb.getManyAndCount();

    return { bids, count };
  },

  async findBidById(bid_id: string) {
    return this.findOne({
      where: { bid_id },
      relations: ["auction", "user"],
    });
  },

  async findBidByAuctionId(
    auction_id: string,
    filter?: Omit<IBidFilter, "auctionId">,
    pagination?: PaginationOptions,
  ) {
    const qb = this.createQueryBuilder("bid")
      .leftJoinAndSelect("bid.auction", "auction")
      .leftJoinAndSelect("bid.user", "user")
      .where("auction.auction_id = :auction_id", { auction_id });

    // Apply filters
    if (filter) {
      applyBidFilters(qb, filter);
    }

    // Apply pagination
    applyPagination(qb, pagination);
    const [bids, count] = await qb.getManyAndCount();
    return { bids, count };
  },

  async findBidByUserId(
    user_id: string,
    filter?: Omit<IBidFilter, "userId">,
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
