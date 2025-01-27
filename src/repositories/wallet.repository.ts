import { SelectQueryBuilder } from "typeorm";
import { applyPagination } from "typeorm-extension";
import { AppDataSource as dataSource } from "../config/data-source";
import Wallet from "../entities/Wallet";
import { IWalletFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";
import { IWalletOrder } from "../types/entityorder.types";

// Function to apply ordering to the Wallet query
const applyWalletOrdering = (
  qb: SelectQueryBuilder<Wallet>,
  order?: IWalletOrder,
) => {
  if (!order || !order.orderBy) {
    qb.addOrderBy("wallet.created_at", "DESC");
    return qb;
  }

  if (order.orderBy === "balance") {
    qb.orderBy("wallet.balance", order.order);
  }

  if (order.orderBy === "created_at") {
    qb.orderBy("wallet.created_at", order.order);
  }

  return qb;
};

// Function to apply filters to the Wallet query
const applyWalletFilters = (
  qb: SelectQueryBuilder<Wallet>,
  filters: IWalletFilter = {},
) => {
  if (filters.walletId) {
    qb.andWhere("wallet.wallet_id = :walletId", { walletId: filters.walletId });
  }

  if (filters.userId) {
    qb.andWhere("wallet.user_id = :userId", { userId: filters.userId });
  }

  if (filters.balanceMin !== undefined) {
    qb.andWhere("wallet.balance >= :balanceMin", {
      balanceMin: filters.balanceMin,
    });
  }

  if (filters.balanceMax !== undefined) {
    qb.andWhere("wallet.balance <= :balanceMax", {
      balanceMax: filters.balanceMax,
    });
  }

  if (filters.createdAtFrom) {
    qb.andWhere("wallet.created_at >= :createdAtFrom", {
      createdAtFrom: filters.createdAtFrom,
    });
  }

  if (filters.createdAtTo) {
    qb.andWhere("wallet.created_at <= :createdAtTo", {
      createdAtTo: filters.createdAtTo,
    });
  }

  return qb;
};

const walletRepository = dataSource.getRepository(Wallet).extend({
  async getAllWallets(
    filters?: IWalletFilter,
    pagination?: PaginationOptions,
    order?: IWalletOrder,
  ) {
    const qb = this.createQueryBuilder("wallet");

    // Apply filters
    applyWalletFilters(qb, filters);
    applyWalletOrdering(qb, order);
    applyPagination(qb, pagination);

    // Fetch results
    const [wallets, count] = await qb.getManyAndCount();
    return { wallets, count };
  },

  async findWalletById(wallet_id: string) {
    const qb = await this.createQueryBuilder("wallet")
      .where("wallet.wallet_id = :wallet_id", { wallet_id })
      .getOne();

    return qb;
  },

  async findWalletByUserId(user_id: string) {
    const qb = await this.createQueryBuilder("wallet")
      .where("wallet.user_id = :user_id", { user_id })
      .getOne();

    if (!qb) {
      throw new Error(`Wallet not found for user with ID ${user_id}`);
    }

    return qb;
  },
});

export default walletRepository;
