import Auction from "../entities/Auction";
import { NotificationType } from "../entities/Notification";
import auctionRepository from "../repositories/auction.repository";
import bidRepository from "../repositories/bid.repository";
import { IBidFilter } from "../types/entityfilter";
import { IBidOrder, SortOrder } from "../types/entityorder.types";
import { PaginationOptions } from "../utils/pagination";
import { ErrorHandler } from "../utils/response/handleError";
import { notificationService } from "./notification.service";

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
  order?: IBidOrder,
) => {
  const { bids, count } = await bidRepository.findBidByAuctionId(
    auction_id,
    filters,
    pagination,
    order,
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
      lock: { mode: "pessimistic_write" }, // Prevent race conditions
    });

    if (!auction) {
      throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
    }

    // Ensure bid is higher than current highest bid
    if (bid_amount <= (auction.current_highest_bid ?? 0)) {
      throw ErrorHandler.badRequest(
        "Bid amount must be higher than the current highest bid.",
      );
    }

    // Extend auction time only if within injury time
    const injuryTime = 1000 * 60 * 5; // 5 minutes
    if (auction.end_datetime.getTime() - Date.now() < injuryTime) {
      auction.end_datetime = new Date(
        auction.end_datetime.getTime() + injuryTime,
      );
    }

    // Create and save the bid
    const bid = bidRepository.create({
      user: { user_id },
      auction: { auction_id },
      bid_amount,
    });

    await transactionalEntityManager.save(bid);

    // Update auction's highest bid
    auction.current_highest_bid = bid_amount;
    await transactionalEntityManager.save(auction);

    // Notify previous highest bidder
    const currentHighestBid = await getBidsByAuctionId(
      auction_id,
      {},
      { limit: 1, page: 1 },
      { orderBy: "bid_amount", order: SortOrder.DESC },
    );

    if (currentHighestBid.bids.length > 0) {
      const highestBidder = currentHighestBid.bids[0]?.user;
      if (highestBidder && highestBidder.user_id !== user_id) {
        await notificationService.createNotification(
          highestBidder.user_id,
          NotificationType.AUCTION,
          `You have been outbid on auction ${auction_id}`,
          auction_id,
        );
      }
    }

    return bid;
  });

export const bidService = {
  getAllBids,
  getBidsByAuctionId,
  getBidByUserId,
  getBidById,
  placeBid,
};
