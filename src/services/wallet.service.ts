import walletRepository from "../repositories/wallet.repository";
import Wallet from "../entities/Wallet";
import { ErrorHandler } from "../utils/response/handleError";
import { IWalletFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";

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
) => {
  const { wallets, count } = await walletRepository.getAllWallets(
    filters,
    paginate,
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
  wallet.balance += amount;
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
