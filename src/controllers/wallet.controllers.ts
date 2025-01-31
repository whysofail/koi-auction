import { RequestHandler, Request, Response } from "express";
import walletRepository from "../repositories/wallet.repository";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response/handleResponse";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { walletService } from "../services/wallet.service";
import { transactionService } from "../services/transaction.service";
import { TransactionStatus, TransactionType } from "../entities/Transaction";
import { IWalletOrder } from "../types/entityorder.types";
import socketService from "../services/socket.service";
import { notificationService } from "../services/notification.service";
import { NotificationRole, NotificationType } from "../entities/Notification";
import { userService } from "../services/user.service";
// Create a new wallet
export const createWallet: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const wallet = await walletRepository.create(req.body);
    return sendSuccessResponse(res, { data: wallet }, 201);
  } catch (error) {
    return sendErrorResponse(res, (error as Error).message, 500);
  }
};

// Get a wallet by ID
export const getWalletById: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const wallet = await walletRepository.findWalletById(req.params.id);
    if (!wallet) {
      return sendErrorResponse(res, "Wallet not found", 404);
    }
    return sendSuccessResponse(res, { data: wallet }, 200);
  } catch (error) {
    return sendErrorResponse(res, (error as Error).message, 500);
  }
};

// Get a wallet by user ID
export const getWalletByUserId: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;
    const wallet = await walletService.getWalletByUserId(user.user_id);
    sendSuccessResponse(res, { data: wallet }, 200);
  } catch (error) {
    next(error);
  }
};

// Update a wallet by ID
export const updateWallet: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const wallet = await walletRepository.update(req.params.id, req.body);
    if (!wallet) {
      return sendErrorResponse(res, "Wallet not found", 404);
    }
    return sendSuccessResponse(res, { data: wallet }, 200);
  } catch (error) {
    return sendErrorResponse(res, (error as Error).message, 500);
  }
};

// Delete a wallet by ID
export const deleteWallet: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const wallet = await walletRepository.delete(req.params.id);
    if (!wallet) {
      return sendErrorResponse(res, "Wallet not found", 404);
    }
    return sendSuccessResponse(
      res,
      { message: "Wallet deleted successfully" },
      200,
    );
  } catch (error) {
    return sendErrorResponse(res, (error as Error).message, 500);
  }
};

// Get all wallets with pagination
export const getAllWallets: RequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { filters, pagination, order } = req;

  try {
    const { wallets, count } = await walletService.getAllWallets(
      filters,
      pagination,
      order as IWalletOrder,
    );
    sendSuccessResponse(res, {
      data: wallets,
      count,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    next(error);
  }
};

export const createDeposit: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  const { amount } = req.body;

  // Ensure proof_of_payment is provided (use only the filename)
  const file = req.file as MulterS3File | undefined;
  const proof_of_payment = file?.key;

  const parsedAmount = parseFloat(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    sendErrorResponse(
      res,
      "Amount must be a valid positive decimal value",
      400,
    );
    return;
  }

  try {
    const wallet = await walletService.getWalletByUserId(user.user_id);

    // Create a new deposit transaction
    const transaction = await transactionService.createTransaction({
      wallet,
      amount: parsedAmount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      proof_of_payment, // Use only the filename here
    });

    if (transaction) {
      const admins = await userService.getAllUsers({ role: "admin" });

      // Create notifications for all admins
      const adminNotifications = await Promise.all(
        admins.users.map((admin) =>
          notificationService.createNotification(
            admin.user_id,
            NotificationType.TRANSACTION,
            `New deposit of $${parsedAmount} from user ${user.user_id}`,
            transaction.transaction_id,
            NotificationRole.ADMIN,
          ),
        ),
      );

      const lastAdminNotification =
        await notificationService.getNotificationById(
          adminNotifications[adminNotifications.length - 1].notification_id,
        );
      if (lastAdminNotification) {
        await socketService.emitToAdminRoom(lastAdminNotification);
      }

      // Create a notification for the user
      const userNotification = await notificationService.createNotification(
        user.user_id,
        NotificationType.TRANSACTION,
        `Your deposit of $${parsedAmount} is pending approval`,
        transaction.transaction_id,
        NotificationRole.USER,
      );

      // Emit the user notification to the user
      await socketService.emitToUser(user.user_id, "user", userNotification);
    }

    // Return the successful response
    sendSuccessResponse(res, { data: transaction }, 201);
  } catch (error) {
    next(error);
  }
};
