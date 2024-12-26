import { RequestHandler, Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import transactionRepository from "../repositories/transaction.repository";
import walletRepository from "../repositories/wallet.repository";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response/handleResponse";
import Transaction, { TransactionStatus } from "../entities/Transaction";
import paginate from "../utils/pagination";

export const getTransactions: RequestHandler = async (req, res) => {
  const { status } = req.query as { status?: TransactionStatus };
  const whereCondition: FindOptionsWhere<Transaction> = {};
  if (status) {
    whereCondition.status = String(status).toUpperCase() as TransactionStatus;
  }

  try {
    const [transactions, count] = await transactionRepository.findAndCount({
      ...paginate(req.query),
      ...whereCondition,
    });

    return sendSuccessResponse(res, { data: transactions, count });
  } catch (error) {
    return sendErrorResponse(res, "Failed to fetch transactions", 500);
  }
};

export const getUserTransactions: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { status } = req.query as { status?: TransactionStatus };
  const user_id = req.user?.user_id ?? "";

  if (!user_id) {
    return sendErrorResponse(res, "User ID is required", 400);
  }

  const whereCondition: FindOptionsWhere<Transaction> = {
    wallet: {
      user_id,
    },
  };

  if (status) {
    whereCondition.status = String(status).toUpperCase() as TransactionStatus;
  }

  try {
    const [transactions, count] = await transactionRepository.findAndCount({
      ...paginate(req.query),
      where: whereCondition,
    });

    return sendSuccessResponse(res, { data: transactions, count });
  } catch (error) {
    return sendErrorResponse(res, "Failed to fetch user transactions", 500);
  }
};
// Create Deposit Transaction
export const createDeposit: RequestHandler = async (req, res) => {
  const { wallet_id, amount, proof_of_payment } = req.body; // proof_of_payment as a string (URL or path)

  // Ensure proof of payment is provided (string, URL, or path)
  if (!proof_of_payment) {
    return sendErrorResponse(res, "Proof of payment is required", 400);
  }

  try {
    // Find the wallet associated with the transaction
    const wallet = await walletRepository.findWalletById(wallet_id);

    if (!wallet) {
      return sendErrorResponse(res, "Wallet not found", 404);
    }

    // Create a new deposit transaction
    const transaction = await transactionRepository.createDepositTransaction(
      wallet_id,
      amount,
      proof_of_payment,
    );

    // Save the transaction
    const savedTransaction = await transactionRepository.save(transaction);

    // Return success response
    return sendSuccessResponse(res, { data: savedTransaction }, 201);
  } catch (error) {
    return sendErrorResponse(res, "Failed to create deposit request", 500);
  }
};

// Update Transaction Status (Approve/Reject)
export const updateTransactionStatus: RequestHandler = async (req, res) => {
  const { transaction_id } = req.params;
  const { status } = req.body as { status: TransactionStatus }; // Expected status: "approved" or "rejected"

  try {
    // Find the transaction by its ID
    const transaction = await transactionRepository.findOneBy({
      transaction_id,
    });

    if (!transaction) {
      return sendErrorResponse(res, "Transaction not found", 404);
    }

    if (transaction.type !== "deposit") {
      return sendErrorResponse(
        res,
        "Only deposit transactions can be updated",
        400,
      );
    }

    // If the status is "approved", update the wallet balance
    if (status === TransactionStatus.APPROVED) {
      const wallet = await walletRepository.findWalletById(
        transaction.wallet.wallet_id,
      );

      if (!wallet) {
        return sendErrorResponse(res, "Wallet not found");
      }

      // Update wallet balance by adding the deposit amount
      wallet.balance += transaction.amount;

      // Save the updated wallet balance
      await walletRepository.save(wallet);
    }

    // Update the transaction status
    transaction.status = status;

    // Save the transaction with the updated status
    const updatedTransaction = await transactionRepository.save(transaction);

    return sendSuccessResponse(res, updatedTransaction);
  } catch (error) {
    return sendErrorResponse(res, "Failed to update transaction status");
  }
};
