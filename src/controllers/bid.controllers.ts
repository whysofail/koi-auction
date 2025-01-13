import { Request, Response, RequestHandler } from "express";
import { Server } from "socket.io";
import { FindOptionsWhere } from "typeorm";
import Auction, { AuctionStatus } from "../entities/Auction";
import Bid from "../entities/Bid";
import paginate from "../utils/pagination";
import buildDateRangeFilter from "../utils/date/dateRange";
import userRepository from "../repositories/user.repository";
import auctionRepository from "../repositories/auction.repository";
import bidRepository from "../repositories/bid.repository";
import validateAndParseDates from "../utils/date/validateAndParseDate";
import {
  handleMissingFields,
  handleNotFound,
} from "../utils/response/handleError";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/response/handleResponse";
import itemRepository from "../repositories/item.repository";
import walletRepository from "../repositories/wallet.repository";
import auctionParticipantRepository from "../repositories/auctionparticipant.repository";
import { io } from "../main";

export const getBids: RequestHandler = async (req: Request, res: Response) => {
  try {
    // Validate and parse dates
    const {
      valid,
      start_datetime: parsedStartDate, // Dari req.query
      end_datetime: parsedEndDate, //  Dari req.query
    } = validateAndParseDates(req, res);
    if (!valid) return;

    // Build date range filter
    const dateRangeFilter = buildDateRangeFilter<Bid>("bid_time" as keyof Bid, {
      start_datetime: parsedStartDate?.toISOString(),
      end_datetime: parsedEndDate?.toISOString(),
    });

    // Construct where condition
    const whereCondition: FindOptionsWhere<Bid> = {
      ...dateRangeFilter,
    };

    // Fetch auctions with filters, pagination, and relations
    const [bids, count] = await bidRepository.findAllAndCount({
      where: whereCondition,
      ...paginate(req.query), // Apply pagination
    });

    sendSuccessResponse(res, {
      data: bids, // Place auctions directly inside data
      count,
    });
  } catch (error) {
    console.error("Error fetching Bids:", error);
    sendErrorResponse(res, "Internal server error");
  }
};

export const getBidsByAuctionId: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { auction_id } = req.query as { auction_id: string };
  try {
    const [bids, count] = await bidRepository.findBidByAuctionId(auction_id);
    return sendSuccessResponse(res, { data: { bids, count } });
  } catch (error) {
    console.error("Error fetching bids by auction ID:", error);
    return sendErrorResponse(res, "Internal Server Error");
  }
};

// Get a wallet by user ID
export const getBidByUserId: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return sendErrorResponse(res, "User ID not found", 400);
    }
    const bid = await bidRepository.findBidByUserId(userId);
    return sendSuccessResponse(res, { data: bid }, 200);
  } catch (error) {
    return sendErrorResponse(res, (error as Error).message, 500);
  }
};

export const placeBid: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { auction_id } = req.params;
  const { bid_amount } = req.body;
  const user_id = req.user?.user_id ?? "";

  // Validate input
  if (!auction_id || !bid_amount) {
    res.status(400).json({ message: "Auction ID and bid amount are required" });
    return;
  }

  try {
    const user = await userRepository.findUserById(user_id);
    if (!user) {
      handleNotFound("User", res);
      return; // Early return to prevent further execution
    }

    // Use database transactions to prevent race conditions
    await auctionRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const auction = await transactionalEntityManager.findOne(Auction, {
          where: { auction_id },
          lock: { mode: "pessimistic_write" },
        });

        if (!auction) {
          handleNotFound("Auction", res);
          return; // Early return to prevent further execution
        }

        // Ensure the auction is active
        if (auction.status !== AuctionStatus.ACTIVE) {
          sendErrorResponse(res, "Auction is not active", 400);
          return; // Early return to prevent further execution
        }

        // Ensure bid is higher than current highest bid
        if (bid_amount <= auction.current_highest_bid) {
          sendErrorResponse(
            res,
            "Bid amount must be higher than current highest bid",
            400,
          );
          return; // Early return to prevent further execution
        }

        // Create and save the bid
        const bid = bidRepository.create({
          auction,
          user,
          bid_amount,
        });

        await transactionalEntityManager.save(bid);

        // Update the auction's current highest bid
        auction.current_highest_bid = bid_amount;
        await transactionalEntityManager.save(auction);

        // Emit the bid update event

        io.to(auction_id).emit("bidUpdate", {
          auctionId: auction_id,
          bidAmount: bid_amount,
          message: `New bid placed for ${bid_amount}`,
        });

        // Send success response
        sendSuccessResponse(res, bid, 201);
      },
    );
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      sendErrorResponse(res, "Internal server error");
    }
  }
};
