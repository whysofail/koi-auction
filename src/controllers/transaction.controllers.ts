import { RequestHandler, Request, Response } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response/handleResponse";

import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { transactionService } from "../services/transaction.service";
import { ITransactionOrder } from "../types/entityorder.types";

export const getTransactions: RequestHandler = async (
  req,
  res,
  next,
): Promise<void> => {
  const { filters, pagination, order } = req;
  try {
    const { transactions, count } = await transactionService.getAllTransactions(
      filters,
      pagination,
      order as ITransactionOrder,
    );
    sendSuccessResponse(res, {
      data: transactions,
      count,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    next(error);
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
