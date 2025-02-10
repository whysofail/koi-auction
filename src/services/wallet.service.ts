import walletRepository from "../repositories/wallet.repository";
import Wallet from "../entities/Wallet";
import { ErrorHandler } from "../utils/response/handleError";
import { IWalletFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";
import { IWalletOrder } from "../types/entityorder.types";

export const createWallet = async (data: any) => {
  try {
    const wallet = await walletRepository.create(data);
    return wallet;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error creating wallet");
  }
};

export const getAllWallets = async (
  filters?: IWalletFilter,
  paginate?: PaginationOptions,
  order?: IWalletOrder,
) => {
  const { wallets, count } = await walletRepository.getAllWallets(
    filters,
    paginate,
    order,
  );
  return { wallets, count };
};

export const getWalletById = async (wallet_id: string): Promise<Wallet> => {
  const wallet = await walletRepository.findWalletById(wallet_id);
  if (!wallet) {
    throw new Error(`Wallet with ID ${wallet_id} not found`);
  }
  return wallet;
};

export const getWalletByUserId = async (user_id: string): Promise<Wallet> => {
  const wallet = await walletRepository.findWalletByUserId(user_id);
  if (!wallet) {
    throw new Error(`Wallet not found for user with ID ${user_id}`);
  }
  return wallet;
};

export const depositToUserWallet = async (
  user_id: string,
  amount: number,
): Promise<Wallet> => {
  const wallet = await getWalletByUserId(user_id);

  console.log("Before update:", wallet);
  console.log("Balance (as string):", wallet.balance);
  console.log("Amount to add:", amount);

  // Ensure balance is treated as a number
  wallet.balance = parseFloat(wallet.balance.toString()) + amount;

  console.log("Updated Balance:", wallet.balance);

  await walletRepository.save(wallet);
  return wallet;
};

export const walletService = {
  createWallet,
  getAllWallets,
  getWalletById,
  getWalletByUserId,
  depositToUserWallet,
};
