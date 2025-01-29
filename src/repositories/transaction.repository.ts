import { SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Transaction, { TransactionStatus } from "../entities/Transaction";
import walletRepository from "./wallet.repository"; // Assuming walletRepository is needed
import { ITransactionFilter } from "../types/entityfilter"; // Correctly import the transaction filter interface
import { PaginationOptions } from "../utils/pagination";
import { ITransactionOrder } from "../types/entityorder.types";

// Helper function to apply common filters to transaction queries
const applyTransactionOrdering = (
  qb: SelectQueryBuilder<Transaction>,
  order?: ITransactionOrder,
) => {
  if (!order || !order.orderBy) {
    qb.addOrderBy("transaction.created_at", "DESC");
    return qb;
  }

  if (order.orderBy === "created_at") {
    qb.orderBy("transaction.created_at", order.order);
  }

  if (order.orderBy === "amount") {
    qb.orderBy("transaction.amount", order.order);
  }

  return qb;
};

const applyTransactionFilters = (
  qb: SelectQueryBuilder<Transaction>,
  filters: ITransactionFilter = {},
) => {
  if (filters.amountMin !== undefined) {
    qb.andWhere("transaction.amount >= :amountMin", {
      amountMin: filters.amountMin, // Fixed variable name
    });
  }

  if (filters.amountMax !== undefined) {
    qb.andWhere("transaction.amount <= :amountMax", {
      amountMax: filters.amountMax, // Fixed variable name
    });
  }

  if (filters.createdAtFrom) {
    qb.andWhere("transaction.created_at >= :createdAtFrom", {
      createdAtFrom: filters.createdAtFrom,
    });
  }

  if (filters.createdAtTo) {
    qb.andWhere("transaction.created_at <= :createdAtTo", {
      createdAtTo: filters.createdAtTo,
    });
  }

  if (filters.walletId) {
    qb.andWhere("transaction.wallet_id = :walletId", {
      walletId: filters.walletId,
    });
  }
  if (filters.type) {
    qb.andWhere("transaction.type = :type", {
      type: filters.type,
    });
  }

  if (filters.status) {
    qb.andWhere("transaction.status = :status", {
      status: filters.status,
    });
  }

  if (filters.transactionId) {
    qb.andWhere("transaction.transaction_id = :transactionId", {
      transactionId: filters.transactionId,
    });
  }
  if (filters.userId) {
    qb.andWhere("user.user_id = :userId", {
      userId: filters.userId,
    });
  }
  if (filters.username) {
    qb.andWhere("user.username = :username", {
      username: filters.username,
    });
  }
};

// Helper function to apply pagination
const applyPagination = (
  qb: SelectQueryBuilder<Transaction>,
  pagination?: PaginationOptions,
) => {
  if (pagination) {
    const { page = 1, limit = 10 } = pagination;
    qb.skip((page - 1) * limit).take(limit);
  }
};

// Extend the base repository with additional methods for transactions
const transactionRepository = dataSource.getRepository(Transaction).extend({
  async getAllTransactions(
    filters?: ITransactionFilter, // Use the correct interface here
    pagination?: PaginationOptions,
    order?: ITransactionOrder,
  ) {
    const qb = this.createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.wallet", "wallet")
      .leftJoin("wallet.user", "user")
      .select([
        "transaction",
        "wallet.wallet_id",
        "wallet.balance",
        "user.user_id",
        "user.username",
      ])
      .leftJoinAndSelect("transaction.admin", "admin");

    // Apply filters

    applyTransactionFilters(qb, filters);
    // Apply ordering
    applyTransactionOrdering(qb, order);
    // Apply pagination
    applyPagination(qb, pagination);

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
