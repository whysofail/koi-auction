import { FindOperator, SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import AuctionBuyNow, { AuctionBuyNowStatus } from "../entities/AuctionBuyNow";
import { IAuctionBuyNowFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";
import { IAuctionBuyNowOrder } from "../types/entityorder.types";

const applyBuyNowOrdering = (
  qb: SelectQueryBuilder<AuctionBuyNow>,
  order?: IAuctionBuyNowOrder,
) => {
  if (!order || !order.orderBy) {
    qb.addOrderBy("buyNow.created_at", "DESC");
    return qb;
  }

  if (order.orderBy === "created_at") {
    qb.orderBy("buyNow.created_at", order.order);
  }

  return qb;
};

const applyBuyNowFilters = (
  qb: SelectQueryBuilder<AuctionBuyNow>,
  filters: IAuctionBuyNowFilter = {},
) => {
  if (filters.status) {
    qb.andWhere("buyNow.status = :status", { status: filters.status });
  }

  if (filters.buyerId) {
    qb.andWhere("buyNow.buyer_id = :buyerId", { buyerId: filters.buyerId });
  }

  if (filters.auctionId) {
    qb.andWhere("buyNow.auction_id = :auctionId", {
      auctionId: filters.auctionId,
    });
  }

  return qb;
};

const applyPagination = (
  queryBuilder: SelectQueryBuilder<AuctionBuyNow>,
  pagination?: PaginationOptions,
) => {
  if (pagination) {
    const { page = 1, limit = 10 } = pagination;
    queryBuilder.skip((page - 1) * limit).take(limit);
  }
};

const auctionBuyNowRepository = dataSource.getRepository(AuctionBuyNow).extend({
  async findAllAndCount(
    filters?: IAuctionBuyNowFilter,
    pagination?: PaginationOptions,
    order?: IAuctionBuyNowOrder,
  ) {
    const qb = this.createQueryBuilder("buyNow")
      .leftJoinAndSelect("buyNow.auction", "auction")
      .leftJoinAndSelect("buyNow.buyer", "buyer")
      .leftJoinAndSelect("buyNow.admin", "admin")
      .select([
        "buyNow",
        "auction.auction_id",
        "auction.title",
        "buyer.user_id",
        "buyer.username",
        "admin.user_id",
        "admin.username",
      ]);

    applyBuyNowFilters(qb, filters);
    applyBuyNowOrdering(qb, order);
    applyPagination(qb, pagination);

    const [buyNows, count] = await qb.getManyAndCount();
    return { buyNows, count };
  },

  async findBuyNowById(auction_buynow_id: string) {
    return this.findOne({
      where: { auction_buynow_id },
      relations: ["auction", "buyer", "admin"],
    });
  },

  async findBuyNowByAuctionId(
    auction_id: string,
    status?: AuctionBuyNowStatus | FindOperator<AuctionBuyNowStatus>,
  ) {
    return this.findOne({
      where: {
        auction_id,
        ...(status && { status }),
      },
      relations: ["auction", "buyer", "admin"],
    });
  },

  async hasBuyNow(auction_id: string): Promise<boolean> {
    const count = await this.createQueryBuilder("buyNow")
      .where("buyNow.auction_id = :auction_id", { auction_id })
      .andWhere("buyNow.status NOT IN (:...excludedStatuses)", {
        excludedStatuses: [
          AuctionBuyNowStatus.CANCELLED,
          AuctionBuyNowStatus.REFUNDED,
        ],
      })
      .getCount();

    return count > 0;
  },
});

export default auctionBuyNowRepository;
