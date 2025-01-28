import Transaction from "../entities/Transaction";
import transactionRepository from "../repositories/transaction.repository";
import { ITransactionFilter } from "../types/entityfilter";
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
) => {
  const { transactions, count } =
    await transactionRepository.getAllTransactions(filters, pagination);
  return { transactions, count };
};

const getTransactionById = async (transaction_id: string) => {
  const transaction =
    await transactionRepository.findTransactionById(transaction_id);
  if (!transaction) {
    throw ErrorHandler.notFound(
      `Transaction with ID ${transaction_id} not found`,
    );
  }
  return transaction;
};

const getTransactionsByUserId = async (user_id: string) => {
  const transactions =
    await transactionRepository.findTransactionsByUserId(user_id);
  if (!transactions) {
    throw ErrorHandler.notFound(
      `Transaction with User ID ${user_id} not found`,
    );
  }
  return transactions;
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
    throw ErrorHandler.internalServerError("Error updating transaction", error);
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
    const updatedTransaction = await transactionRepository
      .update(transaction_id, data)
      .then(async () => {
        if (transaction.status === "approved") {
          // Deposit the amount to the user's wallet
          await walletService.depositToUserWallet(
            transaction.wallet.user_id,
            transaction.amount,
          );
        }
      });

    return updatedTransaction;
  } catch (error) {
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
