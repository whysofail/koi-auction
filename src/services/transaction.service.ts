import Transaction from "../entities/Transaction";
import transactionRepository from "../repositories/transaction.repository";
import { AuthUser } from "../types/auth";
import { ITransactionFilter } from "../types/entityfilter";
import { ITransactionOrder } from "../types/entityorder.types";
import { PaginationOptions } from "../utils/pagination";
import { ErrorHandler } from "../utils/response/handleError";
import { walletService } from "./wallet.service";

const createTransaction = async (data: Partial<Transaction>) => {
  try {
    const transaction = await transactionRepository.create(data);
    await transactionRepository.save(transaction);
    return transaction;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error creating transaction", error);
  }
};

const getAllTransactions = async (
  filters?: Partial<ITransactionFilter>,
  pagination?: PaginationOptions,
  order?: ITransactionOrder,
) => {
  const { transactions, count } =
    await transactionRepository.getAllTransactions(filters, pagination, order);
  return { transactions, count };
};

const getTransactionById = async (transactionId: string, user: AuthUser) => {
  try {
    const transaction =
      await transactionRepository.findTransactionById(transactionId);
    if (user.role === "user" && transaction?.wallet.user_id !== user.user_id) {
      throw ErrorHandler.forbidden(
        "You are not authorized to view this transaction",
      );
    }
    if (!transaction) {
      throw ErrorHandler.notFound(
        `Transaction with ID ${transactionId} not found`,
      );
    }
    return transaction;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    throw ErrorHandler.internalServerError("Error fetching transaction", error);
  }
};

const getTransactionsByUserId = async (
  user_id: string,
  filters?: ITransactionFilter,
  pagination?: PaginationOptions,
  order?: ITransactionOrder,
) => {
  const { transactions, count } =
    await transactionRepository.getAllTransactions(
      {
        userId: user_id,
        ...filters, // Ensure additional filters are applied
      },
      pagination,
      order,
    );

  return { transactions, count };
};

const updateTransaction = async (
  transaction_id: string,
  data: Partial<Transaction>,
) => {
  try {
    // Find the transaction by its ID
    const transaction =
      await transactionRepository.findTransactionById(transaction_id);

    if (!transaction) {
      throw ErrorHandler.notFound(
        `Transaction with ID ${transaction_id} not found`,
      );
    }

    // Update the transaction with the new data
    await transactionRepository.update(transaction_id, data);

    return transaction;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    } else {
      throw ErrorHandler.internalServerError(
        "Error updating transaction",
        error,
      );
    }
  }
};

const updateDepositTransaction = async (
  transaction_id: string,
  data: Partial<Transaction>,
) => {
  try {
    // Find the transaction by its ID
    const transaction =
      await transactionRepository.findTransactionById(transaction_id);

    if (!transaction) {
      throw ErrorHandler.notFound(
        `Transaction with ID ${transaction_id} not found`,
      );
    }

    // Update the transaction with the new data
    Object.assign(transaction, data);
    const updatedTransaction = await transactionRepository.save(transaction);

    if (updatedTransaction.status === "APPROVED") {
      // Deposit the amount to the user's wallet
      let { amount } = updatedTransaction; // Get the updated amount

      // Ensure amount is a valid number
      amount = parseFloat(amount.toString());
      await walletService.depositToUserWallet(
        updatedTransaction.wallet.user_id,
        amount,
      );
    }

    return updatedTransaction;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    }
    throw ErrorHandler.internalServerError("Error updating transaction", error);
  }
};

export const transactionService = {
  getAllTransactions,
  createTransaction,
  getTransactionById,
  getTransactionsByUserId,
  updateTransaction,
  updateDepositTransaction,
};
