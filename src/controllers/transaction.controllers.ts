import { RequestHandler, Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import transactionRepository from "../repositories/transaction.repository";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response/handleResponse";
import Transaction, {
  TransactionStatus,
  TransactionType,
} from "../entities/Transaction";
import paginate from "../utils/pagination";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { transactionService } from "../services/transaction.service";

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

export const getUserTransactions: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  try {
    const transactions = await transactionService.getTransactionsByUserId(
      user.user_id,
    );
    return sendSuccessResponse(res, { data: transactions });
  } catch (error) {
    return sendErrorResponse(res, "Failed to fetch user transactions", 500);
  }
};

// Update Transaction Status (Approve/Reject)
export const updateTransactionStatus: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { transaction_id } = req.query as { transaction_id: string };
  try {
    const transaction = await transactionService.updateTransaction(
      transaction_id,
      req.body,
    );
    // Return success response with the updated transaction
    return sendSuccessResponse(res, { data: transaction });
  } catch (error: any) {
    // General error handling with specific message
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return sendErrorResponse(res, errorMessage, 500);
  }
};

export const updateDepositTransaction: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { transaction_id } = req.query as { transaction_id: string };
  const { user } = req as AuthenticatedRequest;
  const { status } = req.body;

  const data = { status, admin_id: user.user_id };
  try {
    const transaction = await transactionService.updateDepositTransaction(
      transaction_id,
      data,
    );
    sendSuccessResponse(res, { data: transaction });
  } catch (error) {
    next(error);
  }
};
