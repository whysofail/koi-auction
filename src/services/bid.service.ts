import Auction from "../entities/Auction";
import auctionRepository from "../repositories/auction.repository";
import bidRepository from "../repositories/bid.repository";
import { IBidFilter } from "../types/entityfilter";
import { IBidOrder } from "../types/entityorder.types";
import { PaginationOptions } from "../utils/pagination";
import { ErrorHandler } from "../utils/response/handleError";

const getAllBids = async (
  filters?: IBidFilter,
  pagination?: PaginationOptions,
  order?: IBidOrder,
) => {
  const { bids, count } = await bidRepository.findAllAndCount(
    filters,
    pagination,
    order,
  );
  return { bids, count };
};

const getBidsByAuctionId = async (auction_id: string) => {
  const { bids, count } = await bidRepository.findBidByAuctionId(auction_id);
  if (!bids) {
    throw ErrorHandler.notFound(
      `Bids not found for auction with ID ${auction_id}`,
    );
  }

  return { bids, count };
};

const getBidByUserId = async (user_id: string) => {
  const [bids, count] = await bidRepository.findBidByUserId(user_id);
  if (!bids) {
    throw ErrorHandler.notFound(`Bids not found for user with ID ${user_id}`);
  }
  return { bids, count };
};

const getBidById = async (bid_id: string) => {
  const bid = await bidRepository.findBidById(bid_id);
  if (!bid) {
    throw ErrorHandler.notFound(`Bid with ID ${bid_id} not found`);
  }
  return bid;
};

const placeBid = async (
  user_id: string,
  auction_id: string,
  bid_amount: number,
) =>
  // Use a transaction to ensure atomicity
  auctionRepository.manager.transaction(async (transactionalEntityManager) => {
    // Lock the auction row for updates to avoid race conditions
    const auction = await transactionalEntityManager.findOne(Auction, {
      where: { auction_id },
      lock: { mode: "pessimistic_write" },
    });

    // Check if the auction exists
    if (!auction) {
      throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
    }

    // Create the bid
    const bid = bidRepository.create({
      user: { user_id },
      auction: { auction_id },
      bid_amount,
    });

    // Save the bid inside the transaction
    const savedBid = await transactionalEntityManager.save(bid);

    // Return the saved bid
    return savedBid;
  });

export const bidService = {
  getAllBids,
  getBidsByAuctionId,
  getBidByUserId,
  getBidById,
  placeBid,
};
