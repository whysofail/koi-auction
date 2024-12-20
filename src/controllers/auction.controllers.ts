/* eslint-disable @typescript-eslint/naming-convention */
import { Request, Response, RequestHandler } from "express";
import { Server } from "socket.io";
import moment from "moment";
import { FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../config/data-source";
import Auction, { AuctionStatus } from "../entities/Auction";
import Bid from "../entities/Bid";
import User from "../entities/User";
import paginate from "../utils/pagination";
import buildDateRangeFilter from "../utils/dateRange";

// Create an auction
export const createAuction: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { item_id, start_datetime, end_datetime, reserve_price } = req.body;
  const user_id = req.user?.user_id; // Assuming user is authenticated with JWT

  if (!start_datetime || !end_datetime || !item_id || !reserve_price) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const auctionRepo = AppDataSource.getRepository(Auction);
    const userRepo = AppDataSource.getRepository(User);

    // Find the user by their ID (user who is creating the auction)
    const user = await userRepo.findOne({ where: { user_id } });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Create a new auction entity
    const auction = auctionRepo.create({
      start_datetime,
      end_datetime,
      reserve_price,
      status: AuctionStatus.PENDING,
      current_highest_bid: 0,
      item: { item_id },
      user,
    });

    await auctionRepo.save(auction);

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
    const auctionRepo = AppDataSource.getRepository(Auction);

    // Extract query parameters
    const { start_datetime, end_datetime, status, date_column } = req.query;

    console.log({ start_datetime, end_datetime });

    // Initialize where condition
    const whereCondition: FindOptionsWhere<Auction> = {};

    // Parse and validate datetimes
    if (
      start_datetime &&
      !moment(String(start_datetime), "YYYY-MM-DD", true).isValid()
    ) {
      res.status(400).json({ message: "Invalid start_datetime format" });
    }
    if (
      end_datetime &&
      !moment(String(end_datetime), "YYYY-MM-DD", true).isValid()
    ) {
      res.status(400).json({ message: "Invalid end_datetime format" });
    }

    // Build dynamic date range filter
    if (date_column && (start_datetime || end_datetime)) {
      const parsedStartDate = start_datetime
        ? moment.utc(String(start_datetime), "YYYY-MM-DDTHH:mm:ss").toDate()
        : undefined;
      const parsedEndDate = end_datetime
        ? moment.utc(String(end_datetime), "YYYY-MM-DDTHH:mm:ss").toDate()
        : undefined;
      console.log({ parsedStartDate, parsedEndDate });
      const dateRangeFilter = buildDateRangeFilter<Auction>(
        date_column as keyof Auction,
        {
          start_datetime: parsedStartDate?.toISOString(),
          end_datetime: parsedEndDate?.toISOString(),
        },
      );

      if (dateRangeFilter) {
        Object.assign(whereCondition, dateRangeFilter);
      }
    }

    // Apply status filter
    if (status) {
      whereCondition.status = String(status).toUpperCase() as Auction["status"];
    }

    // Debug: Log constructed whereCondition
    console.log("Constructed whereCondition:", whereCondition);

    // Fetch auctions with filters, pagination, and relations
    const [auctions, count] = await auctionRepo.findAndCount({
      where: whereCondition,
      ...paginate(req.query), // Apply pagination
      relations: ["item", "user", "bids"], // Include related entities
    });

    // Respond with auctions and count
    res.status(200).json({ data: auctions, count });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get auction details
export const getAuctionDetails: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { auction_id } = req.params;

  try {
    const auction = await AppDataSource.getRepository(Auction).findOne({
      where: { auction_id },
      relations: ["item", "user", "bids"],
      select: {
        auction_id: true,
        start_datetime: true,
        end_datetime: true,
        status: true,
        current_highest_bid: true,
        reserve_price: true,
        item: { item_id: true, item_name: true, item_description: true },
        user: { user_id: true, username: true, role: true },
        bids: { bid_id: true, bid_amount: true, bid_time: true },
      },
    });

    if (!auction) {
      res.status(404).json({ message: "Auction not found" });
      return;
    }

    res.status(200).json(auction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Place a bid
export const placeBid: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { auction_id, bid_amount } = req.body;
  const user_id = req.user?.user_id; // Assuming user is authenticated with JWT

  if (!auction_id || !bid_amount) {
    res.status(400).json({ message: "Auction ID and bid amount are required" });
    return;
  }

  try {
    const auctionRepo = AppDataSource.getRepository(Auction);
    const bidRepo = AppDataSource.getRepository(Bid);
    const userRepo = AppDataSource.getRepository(User);

    // Find the auction by ID
    const auction = await auctionRepo.findOne({
      where: { auction_id },
      relations: ["bids"],
    });

    if (!auction) {
      res.status(404).json({ message: "Auction not found" });
      return;
    }

    // Ensure the auction is active (if not, we can't place a bid)
    if (auction.status !== AuctionStatus.ACTIVE) {
      res.status(400).json({ message: "Auction is not active" });
      return;
    }

    // Ensure the bid amount is higher than the current highest bid
    if (bid_amount <= auction.current_highest_bid) {
      res
        .status(400)
        .json({ message: "Bid must be higher than the current highest bid" });
      return;
    }

    // Find the user placing the bid
    const user = await userRepo.findOne({ where: { user_id } });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Create a new bid
    const bid = bidRepo.create({
      auction,
      user,
      bid_amount,
    });

    await bidRepo.save(bid);

    // Update the auction’s current highest bid
    auction.current_highest_bid = bid_amount;
    await auctionRepo.save(auction);

    // Emit the bid update to all users in the auction room
    const io: Server = req.app.get("io");
    io.to(auction_id).emit("bidUpdate", {
      auctionId: auction_id,
      bidAmount: bid_amount,
      message: `New bid placed for ${bid_amount}`,
    });

    res.status(201).json(bid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
