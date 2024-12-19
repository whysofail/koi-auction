/* eslint-disable @typescript-eslint/naming-convention */
import { Request, Response, RequestHandler } from "express";
import { Server } from "socket.io";
import { AppDataSource } from "../config/data-source";
import Auction, { AuctionStatus } from "../entities/Auction";
import Bid from "../entities/Bid";
import User from "../entities/User";
import buildAuctionFilters from "../utils/auctionFilter"; // Import the filter builder function

// Create an auction
export const createAuction: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { start_time, end_time, reserve_price, item_id } = req.body;
  const user_id = req.user?.user_id; // Assuming user is authenticated with JWT

  if (!start_time || !end_time || !item_id || !reserve_price) {
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
      start_time,
      end_time,
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
    console.log(req.query);
    const auctionRepo = AppDataSource.getRepository(Auction);

    // Build filters based on the query parameters from the request
    const whereCondition = buildAuctionFilters(req.query);

    // Find auctions based on the filters
    const auctions = await auctionRepo.find({
      where: whereCondition, // Apply filters here
      relations: ["item", "user", "bids"], // Including related entities
    });

    res.status(200).json(auctions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
        start_time: true,
        end_time: true,
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
