import { RequestHandler, Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import transactionRepository from "../repositories/transaction.repository";
import walletRepository from "../repositories/wallet.repository";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response/handleResponse";
import Transaction, {
  TransactionStatus,
  TransactionType,
} from "../entities/Transaction";
import paginate from "../utils/pagination";

export const getTransactions: RequestHandler = async (req, res) => {
  const { status, type } = req.query as {
    status?: TransactionStatus;
    type?: TransactionType;
  };
  const whereCondition: FindOptionsWhere<Transaction> = {};
  if (status) {
    whereCondition.status = String(status).toUpperCase() as TransactionStatus;
  }

  if (type) {
    whereCondition.type = String(type).toUpperCase() as TransactionType;
  }
  console.log(whereCondition);

  try {
    const [transactions, count] = await transactionRepository.findAllAndCount({
      where: whereCondition,
      ...paginate(req.query),
    });

    return sendSuccessResponse(res, { data: transactions, count });
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(res, error.message, 500);
    }
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
      where: whereCondition,
      relations: ["wallet"],
      ...paginate(req.query),
    });

    return sendSuccessResponse(res, { data: transactions, count });
  } catch (error) {
    return sendErrorResponse(res, "Failed to fetch user transactions", 500);
  }
};

// Update Transaction Status (Approve/Reject)
export const updateTransactionStatus: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { transaction_id } = req.query as { transaction_id: string };
  const { status } = req.body as { status: TransactionStatus }; // Expected status: "approved" or "rejected"
  const admin_id = req.user?.user_id; // admin_id from the authenticated user

  // Check if transaction_id is provided
  if (!transaction_id) {
    return sendErrorResponse(res, "Transaction ID is required", 400);
  }

  try {
    // Find the transaction by its ID
    const transaction =
      await transactionRepository.findTransactionById(transaction_id);

    // If transaction is not found
    if (!transaction) {
      return sendErrorResponse(res, "Transaction not found", 404);
    }

    // Ensure that only deposit transactions can be updated
    if (transaction.type !== "deposit") {
      return sendErrorResponse(
        res,
        "Only deposit transactions can be updated",
        400,
      );
    }

    if (transaction.status !== "pending") {
      return sendErrorResponse(
        res,
        "Only pending transactions can be updated",
        400,
      );
    }

    // If the status is "approved", update the wallet balance
    if (status === TransactionStatus.APPROVED) {
      const wallet = await walletRepository.findWalletById(
        transaction.wallet.wallet_id,
      );

      // If wallet is not found
      if (!wallet) {
        return sendErrorResponse(res, "Wallet not found", 404);
      }

      // Update wallet balance by adding the deposit amount
      const currentBalance = parseFloat(wallet.balance.toString());
      const depositAmount = parseFloat(transaction.amount.toString());
      wallet.balance = parseFloat((currentBalance + depositAmount).toFixed(2)); // Fixing to 2 decimal places

      // Save the updated wallet balance
      await walletRepository.save(wallet);
    }

    // Update the transaction status
    transaction.status = status;
    transaction.admin_id = admin_id ?? null;

    // Save the transaction with the updated status
    const updatedTransaction = await transactionRepository.save(transaction);

    // Return success response with the updated transaction
    return sendSuccessResponse(res, updatedTransaction);
  } catch (error: any) {
    // General error handling with specific message
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return sendErrorResponse(res, errorMessage, 500);
  }
};
