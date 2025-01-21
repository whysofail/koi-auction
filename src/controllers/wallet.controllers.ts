import { RequestHandler, Request, Response } from "express";
import paginate from "../utils/pagination";
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
) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const wallet = await walletRepository.findWalletByUserId(user.user_id);
    if (!wallet) {
      return sendErrorResponse(res, "Wallet not found", 404);
    }
    return sendSuccessResponse(res, { data: wallet }, 200);
  } catch (error) {
    return sendErrorResponse(res, (error as Error).message, 500);
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
) => {
  try {
    const [wallets, count] = await walletRepository.findAndCount({
      ...paginate(req.query),
    });
    return sendSuccessResponse(res, { data: wallets, count }, 200);
  } catch (error) {
    return sendErrorResponse(res, (error as Error).message, 500);
  }
};

// Create Deposit Transaction
export const createDeposit: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { user } = req as AuthenticatedRequest;
  const { amount } = req.body;

  // Ensure proof_of_payment is provided (file is now handled by multer)
  const proof_of_payment = req.file?.path; // `req.file` comes from the multer middleware

  const parsedAmount = parseFloat(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return sendErrorResponse(
      res,
      "Amount must be a valid positive decimal value",
      400,
    );
  }

  try {
    const wallet = await walletService.getWalletByUserId(user.user_id);

    // Create a new deposit transaction
    const transaction = await transactionService.createTransaction({
      wallet,
      amount: parsedAmount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      proof_of_payment,
    });

    // Return the successful response
    return sendSuccessResponse(res, { data: transaction }, 201);
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, "Failed to create deposit request", 500);
  }
};
