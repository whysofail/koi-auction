import { FindManyOptions, SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Transaction, { TransactionStatus } from "../entities/Transaction";
import walletRepository from "./wallet.repository"; // Assuming walletRepository is needed
import { ITransactionFilter } from "../types/entityfilter"; // Correctly import the transaction filter interface
import { PaginationOptions } from "../utils/pagination";

// Helper function to apply common filters to transaction queries
const applyTransactionFilters = (
  queryBuilder: SelectQueryBuilder<Transaction>,
  filter: Partial<ITransactionFilter>,
) => {
  if (filter.amountMin !== undefined) {
    queryBuilder.andWhere("transaction.amount >= :amountMin", {
      amountMin: filter.amountMin, // Fixed variable name
    });
  }

  if (filter.amountMax !== undefined) {
    queryBuilder.andWhere("transaction.amount <= :amountMax", {
      amountMax: filter.amountMax, // Fixed variable name
    });
  }

  if (filter.createdAtFrom) {
    queryBuilder.andWhere("transaction.created_at >= :createdAtFrom", {
      createdAtFrom: filter.createdAtFrom,
    });
  }

  if (filter.createdAtTo) {
    queryBuilder.andWhere("transaction.created_at <= :createdAtTo", {
      createdAtTo: filter.createdAtTo,
    });
  }

  if (filter.walletId) {
    queryBuilder.andWhere("transaction.wallet_id = :walletId", {
      walletId: filter.walletId,
    });
  }

  if (filter.status) {
    queryBuilder.andWhere("transaction.status = :status", {
      status: filter.status,
    });
  }

  if (filter.transactionId) {
    queryBuilder.andWhere("transaction.transaction_id = :transactionId", {
      transactionId: filter.transactionId,
    });
  }
};

// Helper function to apply pagination
const applyPagination = (
  queryBuilder: SelectQueryBuilder<Transaction>,
  pagination?: PaginationOptions,
) => {
  if (pagination) {
    const { page = 1, limit = 10 } = pagination;
    queryBuilder.skip((page - 1) * limit).take(limit);
  }
};

// Extend the base repository with additional methods for transactions
const transactionRepository = dataSource.getRepository(Transaction).extend({
  async getAllTransactions(
    filter?: ITransactionFilter, // Use the correct interface here
    pagination?: PaginationOptions,
    options?: FindManyOptions<Transaction>,
  ) {
    const qb = this.createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.wallet", "wallet")
      .leftJoinAndSelect("transaction.admin", "admin");

    // Apply filters
    if (filter) {
      applyTransactionFilters(qb, filter);
    }

    // Apply pagination
    applyPagination(qb, pagination);

    // Apply additional options if provided
    if (options?.order) {
      Object.entries(options.order).forEach(([key, value]) => {
        qb.addOrderBy(`transaction.${key}`, value as "ASC" | "DESC");
      });
    }
    const [transactions, count] = await qb.getManyAndCount();

    return { transactions, count };
  },

  async findTransactionById(transaction_id: string) {
    return this.findOne({
      where: { transaction_id },
      relations: ["wallet", "admin"], // Include relationships with wallet and admin
    });
  },

  async findTransactionsByWalletId(wallet_id: string) {
    return this.findAndCount({
      where: { wallet: { wallet_id } },
      relations: ["wallet", "admin"], // Include relationships with wallet and admin
      order: { created_at: "DESC" }, // Order by creation date
    });
  },

  async findTransactionsByStatus(status: TransactionStatus) {
    return this.find({
      where: { status },
      relations: ["wallet", "admin"], // Include relationships with wallet and admin
      order: { created_at: "DESC" },
    });
  },

  async findTransactionsByUserId(user_id: string) {
    const qb = this.createQueryBuilder("transaction")
      .leftJoin("transaction.wallet", "wallet")
      .leftJoin("wallet.user", "user")
      .where("user.user_id = :user_id", { user_id });

    return qb.getMany();
  },

  async createTransaction(
    wallet_id: string,
    amount: number,
    proof_of_payment: string | null,
    status: TransactionStatus = TransactionStatus.PENDING,
  ) {
    // First, fetch the Wallet instance by wallet_id
    const wallet = await walletRepository.findOne({
      where: { wallet_id },
      relations: ["user"], // Optionally include relations if needed
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Create a new transaction
    const transaction = this.create({
      wallet,
      amount,
      proof_of_payment,
      status, // Default status when created is PENDING
    });

    return this.save(transaction); // Save the transaction to the database
  },

  async updateTransactionStatus(
    transaction_id: string,
    status: TransactionStatus,
  ) {
    return this.update({ transaction_id }, { status });
  },
});

export default transactionRepository;
