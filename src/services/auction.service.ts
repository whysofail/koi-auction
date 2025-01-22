import auctionRepository from "../repositories/auction.repository";
import walletRepository from "../repositories/wallet.repository";
import auctionParticipantRepository from "../repositories/auctionparticipant.repository";
import transactionRepository from "../repositories/transaction.repository";
import { TransactionType, TransactionStatus } from "../entities/Transaction";
import { ErrorHandler } from "../utils/response/handleError";
import Auction, { AuctionStatus } from "../entities/Auction";
import { PaginationOptions } from "../utils/pagination";
import { IAuctionFilter } from "../types/entityfilter";

const getAllAuctions = async (
  filters?: IAuctionFilter,
  pagination?: PaginationOptions,
) => {
  const auctions = await auctionRepository.getAllAuctions(filters, pagination);
  return auctions;
};

const getAuctionById = async (auction_id: string, filters?: any) => {
  const auction = await auctionRepository.findAuctionById(auction_id, filters);
  if (!auction) {
    throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
  }
  return auction;
};

const getAuctionWithBids = async (auction_id: string, filters?: any) => {
  if (!auction_id) {
    throw ErrorHandler.badRequest("Auction ID is required");
  }

  const auction = await auctionRepository.findAuctionWithBids(
    auction_id,
    filters,
  );
  if (!auction) {
    throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
  }

  return auction;
};

const createAuction = async (
  data: Partial<Auction & { item_id: string }>,
  user_id: string,
) => {
  try {
    const auction = await auctionRepository.create({
      ...data,
      user: { user_id },
    });
    await auctionRepository.save(auction);
    return auction;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error creating auction", error);
  }
};

const updateAuction = async (
  auction_id: string,
  user_id: string,
  data: Partial<Auction>,
) => {
  try {
    const {
      title,
      description,
      start_datetime,
      end_datetime,
      reserve_price,
      item,
    } = data;
    let auction = await auctionRepository.findAuctionById(auction_id);
    if (!auction) {
      throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
    }

    await auctionRepository.update(auction_id, {
      title,
      description,
      item,
      reserve_price,
      start_datetime,
      end_datetime,
      status: data.status?.toUpperCase() as AuctionStatus,
      user: { user_id },
    });

    auction = await auctionRepository.findAuctionById(auction_id);

    return auction;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error updating auction", error);
  }
};

const joinAuction = async (auction_id: string, user_id: string) => {
  try {
    const auction = await auctionRepository.findAuctionById(auction_id);
    if (!auction) {
      throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
    }

    const reservePrice = auction.reserve_price ?? 0;
    const participationFee = reservePrice * 0.1;

    // Deduct participation fee from the user's wallet
    const wallet = await walletRepository.findWalletByUserId(user_id);
    if (wallet.balance < participationFee) {
      throw ErrorHandler.badRequest("Insufficient balance");
    }

    wallet.balance -= participationFee;
    await walletRepository.save(wallet);

    // Create a transaction for the participation fee
    const transaction = transactionRepository.create({
      wallet,
      amount: participationFee,
      type: TransactionType.PARTICIPATE,
      status: TransactionStatus.PENDING,
      proof_of_payment: null,
    });
    await transactionRepository.save(transaction);

    // Add the user as a participant in the auction
    const auctionParticipant = auctionParticipantRepository.create({
      auction,
      user: { user_id },
    });
    await auctionParticipantRepository.save(auctionParticipant);

    return {
      message: "User successfully joined the auction",
      participationFee,
      auctionParticipant,
    };
  } catch (error) {
    throw ErrorHandler.internalServerError("Error joining auction", error);
  }
};

export const auctionService = {
  getAllAuctions,
  getAuctionById,
  getAuctionWithBids,
  joinAuction,
  createAuction,
  updateAuction,
};
