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

const getBidsByAuctionId = async (
  auction_id: string,
  filters?: IBidFilter,
  pagination?: PaginationOptions,
) => {
  const { bids, count } = await bidRepository.findBidByAuctionId(
    auction_id,
    filters,
    pagination,
  );
  if (!bids) {
    throw ErrorHandler.notFound(
      `Bids not found for auction with ID ${auction_id}`,
    );
  }

  return { bids, count };
};

const getBidByUserId = async (
  user_id: string,
  filters?: IBidFilter,
  pagination?: PaginationOptions,
) => {
  const { bids, count } = await bidRepository.findBidByUserId(
    user_id,
    filters,
    pagination,
  );
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
  auctionRepository.manager.transaction(async (transactionalEntityManager) => {
    const auction = await transactionalEntityManager.findOne(Auction, {
      where: { auction_id },
      lock: { mode: "pessimistic_write" },
    });

    if (!auction) {
      throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
    }

    // Extend auction time only if within injury time
    const injuryTime = 1000 * 60 * 5; // 5 minutes
    if (auction.end_datetime.getTime() - Date.now() < injuryTime) {
      auction.end_datetime = new Date(
        auction.end_datetime.getTime() + injuryTime,
      );
      await transactionalEntityManager.save(auction); // Save auction update
    }

    // Create and save the bid
    const bid = bidRepository.create({
      user: { user_id },
      auction: { auction_id },
      bid_amount,
    });

    return transactionalEntityManager.save(bid);
  });

export const bidService = {
  getAllBids,
  getBidsByAuctionId,
  getBidByUserId,
  getBidById,
  placeBid,
};
