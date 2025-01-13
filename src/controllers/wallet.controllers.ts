import { RequestHandler, Request, Response } from "express";
import paginate from "../utils/pagination";
import walletRepository from "../repositories/wallet.repository";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/response/handleResponse";
import userRepository from "../repositories/user.repository";
import transactionRepository from "../repositories/transaction.repository";
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

// Create Deposit Transaction
export const createDeposit: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const user_id = req.user?.user_id ?? "";
  const { amount } = req.body;

  // Ensure user_id is provided
  if (!user_id) {
    return sendErrorResponse(res, "User ID is required", 400);
  }

  // Ensure proof_of_payment is provided (file is now handled by multer)
  const proof_of_payment = req.file?.path; // `req.file` comes from the multer middleware

  if (!proof_of_payment) {
    return sendErrorResponse(res, "Proof of payment is required", 400);
  }
  const parsedAmount = parseFloat(amount);
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return sendErrorResponse(
      res,
      "Amount must be a valid positive decimal value",
      400,
    );
  }

  try {
    // Find the user and their associated wallet
    const user = await userRepository.findUserById(user_id);
    if (!user || !user.wallet?.wallet_id) {
      return sendErrorResponse(res, "Wallet not found", 404);
    }

    const { wallet_id } = user.wallet;
    const wallet = await walletRepository.findWalletById(wallet_id);

    if (!wallet) {
      return sendErrorResponse(res, "Wallet not found", 404);
    }

    // Create a new deposit transaction
    const transaction = await transactionRepository.createDepositTransaction(
      wallet_id,
      parsedAmount,
      proof_of_payment, // Store the file path or URL for the proof
    );

    // Save the transaction in the database
    const savedTransaction = await transactionRepository.save(transaction);

    // Return the successful response
    return sendSuccessResponse(res, { data: savedTransaction }, 201);
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, "Failed to create deposit request", 500);
  }
};
