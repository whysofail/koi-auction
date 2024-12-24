import { Request, Response, RequestHandler } from "express";
import { Server } from "socket.io";
import { FindOptionsWhere } from "typeorm";
import Auction, { AuctionStatus } from "../entities/Auction";
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

export const createAuction: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { item_id, start_datetime, end_datetime, reserve_price } = req.body;
  const user_id = req.user?.user_id ?? "";

  // Handle missing fields
  if (
    handleMissingFields(res, {
      start_datetime,
      end_datetime,
      item_id,
      reserve_price,
    })
  ) {
    return;
  }

  // Validate and parse dates
  const {
    valid,
    start_datetime: parsedStartDate,
    end_datetime: parsedEndDate,
  } = validateAndParseDates(req, res);

  if (!valid) return;

  try {
    // Retrieve the user from the repository
    const user = await userRepository.findUserById(user_id);
    const item = await itemRepository.findItemById(item_id);

    if (!user) {
      handleNotFound("User", res);
      return;
    }

    if (!item) {
      handleNotFound("Item", res);
      return;
    }

    const existingAuction = await auctionRepository.findOne({
      where: {
        item: { item_id }, // Find auction by item
      },
    });

    if (existingAuction) {
      sendErrorResponse(res, "Item is already part of an auction.", 400);
      return;
    }

    // Create the auction using parsed dates
    const auction = auctionRepository.create({
      start_datetime: parsedStartDate, // Use parsed start datetime
      end_datetime: parsedEndDate, // Use parsed end datetime
      reserve_price,
      status: AuctionStatus.PENDING,
      current_highest_bid: 0,
      item: { item_id },
      user,
    });

    // Save the auction to the database
    await auctionRepository.save(auction);

    // Respond with the created auction
    res.status(201).json(auction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all auctions
export const getAuctions: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Extract query parameters
    const { status, date_column } = req.query;

    // Validate and parse dates
    const {
      valid,
      start_datetime: parsedStartDate, // Dari req.query
      end_datetime: parsedEndDate, //  Dari req.query
    } = validateAndParseDates(req, res);
    if (!valid) return;

    // Build date range filter
    const dateRangeFilter = buildDateRangeFilter<Auction>(
      (date_column ?? "created_at") as keyof Auction, // Fallback to 'created_at' safely
      {
        start_datetime: parsedStartDate?.toISOString(),
        end_datetime: parsedEndDate?.toISOString(),
      },
    );

    // Construct where condition
    const whereCondition: FindOptionsWhere<Auction> = {
      ...dateRangeFilter,
    };

    // Add status directly to whereCondition if present
    if (status) {
      whereCondition.status = String(status).toUpperCase() as Auction["status"];
    }

    // Fetch auctions with filters, pagination, and relations
    const [auctions, count] = await auctionRepository.findAndCount({
      where: whereCondition,
      ...paginate(req.query), // Apply pagination
      relations: ["item", "user", "bids"], // Include related entities
    });

    sendSuccessResponse(res, { data: auctions, count });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    sendErrorResponse(res, "Internal server error");
  }
};

// Get auction details
export const getAuctionDetails: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { auction_id } = req.params;

  try {
    const auction = await auctionRepository.findAuctionById(auction_id);

    if (!auction) {
      handleNotFound("Auction", res);
      return;
    }

    sendSuccessResponse(res, auction);
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, "Internal server error");
  }
};

// Place a bid
export const placeBid: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { auction_id, bid_amount } = req.body;
  const user_id = req.user?.user_id ?? "";

  if (!auction_id || !bid_amount) {
    res.status(400).json({ message: "Auction ID and bid amount are required" });
    return;
  }

  try {
    const auction = await auctionRepository.findAuctionWithBids(auction_id);

    if (!auction) {
      handleNotFound("Auction", res);
      return;
    }

    // Ensure the auction is active
    if (auction.status !== AuctionStatus.ACTIVE) {
      sendErrorResponse(res, "Auction is not active", 400);
      return;
    }

    // Ensure bid is higher than current highest bid
    if (bid_amount <= auction.current_highest_bid) {
      sendErrorResponse(
        res,
        "Bid amount must be higher than current highest bid",
        400,
      );
      return;
    }

    const user = await userRepository.findUserById(user_id);
    if (!user) {
      handleNotFound("User", res);
    }

    const bid = bidRepository.create({
      auction,
      user,
      bid_amount,
    });

    await bidRepository.save(bid);

    auction.current_highest_bid = bid_amount;
    await auctionRepository.save(auction);

    const io: Server = req.app.get("io");
    io.to(auction_id).emit("bidUpdate", {
      auctionId: auction_id,
      bidAmount: bid_amount,
      message: `New bid placed for ${bid_amount}`,
    });

    sendSuccessResponse(res, bid, 201);
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, "Internal server error");
  }
};
