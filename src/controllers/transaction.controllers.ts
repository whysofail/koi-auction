import { RequestHandler, Request, Response } from "express";
import { sendSuccessResponse } from "../utils/response/handleResponse";

import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { transactionService } from "../services/transaction.service";
import { ITransactionOrder } from "../types/entityorder.types";
import { NotificationType } from "../entities/Notification";
import { notificationService } from "../services/notification.service";

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

export const getTransactionById: AuthenticatedRequestHandler = async (
  req,
  res,
  next,
) => {
  const { user } = req as AuthenticatedRequest;
  const { id } = req.params;

  try {
    const transaction = await transactionService.getTransactionById(id, user);
    sendSuccessResponse(res, { data: transaction });
  } catch (error) {
    next(error);
  }
};

export const getUserTransactions: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { user, pagination, filters, order } = req as AuthenticatedRequest;

  try {
    const { transactions, count } =
      await transactionService.getTransactionsByUserId(
        user.user_id,
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

export const updateDepositTransaction: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { id } = req.params;
  const { user } = req as AuthenticatedRequest;
  const { status } = req.body;

  const data = { status, admin_id: user.user_id };
  try {
    const transaction = await transactionService.updateDepositTransaction(
      id,
      data,
    );
    const notificationMessage = `Your transaction with ID ${id} has been ${status}`;
    notificationService.createNotification(
      transaction.wallet.user_id,
      NotificationType.TRANSACTION,
      notificationMessage,
      transaction.transaction_id,
    );
    sendSuccessResponse(res, { data: transaction });
  } catch (error) {
    next(error);
  }
};
