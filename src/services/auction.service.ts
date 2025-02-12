import auctionRepository from "../repositories/auction.repository";
import walletRepository from "../repositories/wallet.repository";
import auctionParticipantRepository from "../repositories/auctionparticipant.repository";
import transactionRepository from "../repositories/transaction.repository";
import { TransactionType, TransactionStatus } from "../entities/Transaction";
import { ErrorHandler } from "../utils/response/handleError";
import Auction, { AuctionStatus } from "../entities/Auction";
import { PaginationOptions } from "../utils/pagination";
import { IAuctionFilter } from "../types/entityfilter";
import { IAuctionOrder } from "../types/entityorder.types";
import { auctionJobs } from "../jobs/auction.jobs";
import userRepository from "../repositories/user.repository";
import socketService from "./socket.service";

export const getAllAuctions = async (
  filters?: IAuctionFilter,
  pagination?: PaginationOptions,
  order?: IAuctionOrder,
) => {
  const { auctions, count } = await auctionRepository.getAllAuctions(
    filters,
    pagination,
    order,
  );
  return { auctions, count };
};

const getAuctionById = async (auction_id: string) => {
  const auction = await auctionRepository.findAuctionById(auction_id);
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
      item,
      reserve_price,
      bid_increment,
      status,
    } = data;

    // Fetch the auction by ID to ensure it exists and get the full entity
    const auction = await auctionRepository.findAuctionById(auction_id);

    if (!auction) {
      throw ErrorHandler.notFound("Auction not found");
    }

    // Update the auction entity with new data
    auction.title = title ?? auction.title;
    auction.description = description ?? auction.description;
    auction.item = item ?? auction.item;
    auction.start_datetime = start_datetime ?? auction.start_datetime;
    auction.end_datetime = end_datetime ?? auction.end_datetime;
    auction.reserve_price = reserve_price ?? auction.reserve_price;
    auction.bid_increment = bid_increment ?? auction.bid_increment;
    auction.status = (status?.toUpperCase() as AuctionStatus) ?? auction.status;

    // Fetch only necessary user information, e.g., user_id
    const user = await userRepository.findUserById(user_id);
    if (!user) {
      throw ErrorHandler.notFound(`User with ID ${user_id} not found`);
    }

    auction.user = user; // Assign the user entity with only necessary fields

    // Save the updated auction entity
    await auctionRepository.save(auction);

    // If the auction is published, schedule its start
    if (auction.status === AuctionStatus.PUBLISHED) {
      auctionJobs.schedule(auction);
    }

    // Return auction without full user details
    return {
      ...auction,
      user: {
        user_id: auction.user.user_id, // Only return the user_id
      },
    };
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
      status: TransactionStatus.COMPLETED,
      proof_of_payment: null,
    });
    await transactionRepository.save(transaction);

    // Add the user as a participant in the auction
    const auctionParticipant = auctionParticipantRepository.create({
      auction,
      user: { user_id },
    });
    await auctionParticipantRepository.save(auctionParticipant);

    await socketService.emitToRoom(`auction:${auction_id}`, "update", {
      entity: "auction",
      data: auction,
    });

    return {
      message: "User successfully joined the auction",
      participationFee,
      auctionParticipant,
    };
  } catch (error) {
    throw ErrorHandler.internalServerError("Error joining auction", error);
  }
};

export const getAuctionEndingSoon = async (
  startDateFrom: Date = new Date(), // Default to the start of today
  startDateTo: Date = new Date(new Date().setHours(23, 59, 59, 999)), // Default to the end of today
) => {
  const filters: IAuctionFilter = {
    startDateFrom, // Pass Date object directly
    startDateTo, // Pass Date object directly
    status: AuctionStatus.STARTED,
  };

  const { auctions, count } = await auctionRepository.getAllAuctions(filters);
  return { auctions, count };
};

const leaveAuction = async (auction_id: string, user_id: string) => {
  try {
    const auction = await auctionRepository.findAuctionById(auction_id);
    if (!auction) {
      throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
    }

    const auctionParticipant = await auctionParticipantRepository.findOne({
      where: { auction: { auction_id }, user: { user_id } },
      relations: ["user", "auction"], // Ensure the relations are correctly loaded
    });
    if (!auctionParticipant) {
      throw ErrorHandler.notFound("User not found in auction");
    }

    await auctionParticipantRepository.delete(
      auctionParticipant.auction_participant_id,
    );
    return { message: "User successfully left the auction" };
  } catch (error) {
    throw ErrorHandler.internalServerError("Error leaving auction", error);
  }
};

const deleteAuction = async (auction_id: string, user_id: string) => {
  try {
    const auction = await auctionRepository.findAuctionById(auction_id);
    if (!auction) {
      throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
    }

    await auctionRepository.update(auction_id, {
      status: AuctionStatus.DELETED,
      user: { user_id },
    });
    auctionJobs.cancel(auction_id);
    return auction;
  } catch (error) {
    throw ErrorHandler.internalServerError("Error deleting auction", error);
  }
};

export const auctionService = {
  getAllAuctions,
  getAuctionById,
  getAuctionWithBids,
  joinAuction,
  createAuction,
  updateAuction,
  getAuctionEndingSoon,
  deleteAuction,
  leaveAuction,
};
