import { RequestHandler, Request, Response } from "express";
import paginate from "../utils/pagination";
import walletRepository from "../repositories/wallet.repository";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response/handleResponse";
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
export const getWalletByUserId: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return sendErrorResponse(res, "User ID not found", 400);
    }
    const wallet = await walletRepository.findWalletByUserId(userId);
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
