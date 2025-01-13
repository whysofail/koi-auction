import { Request, Response, RequestHandler } from "express";
import { FindOptionsWhere } from "typeorm";
import Auction, { AuctionStatus } from "../entities/Auction";
import paginate from "../utils/pagination";
import buildDateRangeFilter from "../utils/date/dateRange";
import userRepository from "../repositories/user.repository";
import auctionRepository from "../repositories/auction.repository";
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
import transactionRepository from "../repositories/transaction.repository";
import { TransactionStatus, TransactionType } from "../entities/Transaction";

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

    // Respond wi th the created auction
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

    // Validate and p arse dates
    const {
      valid,
      start_datetime: parsedStartDate, // Da ri req.query
      end_datetime: parsedEndDate, //  Dari req.query
    } = validateAndParseDates(req, res);
    if (!valid) return;

    // Buil d date range filter
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
      whereCondition.status = String(status).toUpperCase() as AuctionStatus;
    }

    // Fetch auctions with filters, pagination, and relations
    const [auctions, count] = await auctionRepository.findAndCount({
      where: whereCondition,
      ...paginate(req.query), // Apply pagination
      relations: ["item", "user", "bids"], // Include related entities
    });

    sendSuccessResponse(res, {
      data: auctions, // Pla ce auctions directly inside data
      count,
    });
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

    sendSuccessResponse(res, {
      data: [auction], // Place auctions directly inside data
    });
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, "Internal server error");
  }
};

export const updateAuction: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { auction_id } = req.params;
  const { start_datetime, end_datetime, reserve_price, status, item_id } =
    req.body;
  const user_id = req.user?.user_id ?? "";

  // Validate required fields if any
  if (
    handleMissingFields(res, {
      start_datetime,
      end_datetime,
      reserve_price,
      status,
    })
  ) {
    return;
  }

  // Validate and parse dates if present
  const {
    valid,
    start_datetime: parsedStartDate,
    end_datetime: parsedEndDate,
  } = validateAndParseDates(req, res);
  if (!valid) return;

  try {
    const auction = await auctionRepository.findAuctionById(auction_id);

    if (!auction) {
      handleNotFound("Auction", res);
      return;
    }

    // Ensure the user is authorized to update the auction (check ownership or admin role)
    if (auction.user.user_id !== user_id) {
      sendErrorResponse(
        res,
        "You are not authorized to update this auction",
        403,
      );
      return;
    }

    // TODO: Discuss. possible edit if auction has ended or expired
    if (
      auction.status === AuctionStatus.EXPIRED ||
      auction.status === AuctionStatus.COMPLETED
    ) {
      sendErrorResponse(
        res,
        "Auction cannot be updated as it has already ended or expired",
        400,
      );
      return;
    }

    // Update only the allowed fields
    if (start_datetime) {
      auction.start_datetime = parsedStartDate ?? auction.start_datetime;
    }

    if (end_datetime) {
      auction.end_datetime = parsedEndDate ?? auction.end_datetime;
    }

    if (reserve_price) {
      auction.reserve_price = reserve_price;
    }

    if (status) {
      // Validate the status if provided and ensure it's a valid enum value
      const validStatuses = Object.values(AuctionStatus);
      if (!validStatuses.includes(status.toUpperCase() as AuctionStatus)) {
        sendErrorResponse(
          res,
          `Invalid status value. Valid values are: ${validStatuses.join(", ")}`,
          400,
        );
        return;
      }

      auction.status = status.toUpperCase() as AuctionStatus;
    }

    if (item_id) {
      // Check if the new item exists
      const newItem = await itemRepository.findItemById(item_id);
      if (!newItem) {
        sendErrorResponse(res, "Item not found", 404);
        return;
      }

      // Check if the item is already part of another active auction
      const existingAuctionWithItem = await auctionRepository.findOne({
        where: {
          item: { item_id },
        },
      });

      if (existingAuctionWithItem) {
        sendErrorResponse(
          res,
          "Item is already part of an active auction",
          400,
        );
        return;
      }

      // Update the item associated with the auction
      auction.item = newItem;
    }

    // Sav e the updated auction to the database
    await auctionRepository.save(auction);

    //  Respond with the updated auction
    sendSuccessResponse(res, auction);
  } catch (error) {
    console.error(error);
    sendErrorResponse(res, "Internal server error");
  }
};

// Join Auction
export const joinAuction: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { auction_id } = req.params;
  const user_id = req.user?.user_id ?? "";

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

    // Calculate 10% of the reserve price
    const reservePrice = auction.reserve_price ?? 0;
    const participationFee = reservePrice * 0.1;

    if (participationFee <= 0) {
      sendErrorResponse(res, "Invalid auction reserve price", 400);
      return;
    }

    // Fetch user and wallet
    const user = await userRepository.findUserById(user_id);

    if (!user) {
      handleNotFound("User", res);
      return;
    }

    const wallet = await walletRepository.findWalletByUserId(user_id);

    if (!wallet) {
      handleNotFound("Wallet", res);
      return;
    }

    // Ensure the user has sufficient balance
    if (wallet.balance < participationFee) {
      sendErrorResponse(res, "Insufficient wallet balance", 400);
      return;
    }

    // Check if the user is already a participant in the auction
    const existingParticipant = await auctionParticipantRepository.findOne({
      where: {
        auction: { auction_id },
        user: { user_id },
      },
    });

    if (existingParticipant) {
      sendErrorResponse(
        res,
        "User is already a participant in this auction",
        400,
      );
      return;
    }

    // Deduct the participation fee from the wallet
    wallet.balance -= participationFee;
    await walletRepository.save(wallet);

    // Create PARTICIPATE transaction
    const transaction = transactionRepository.create({
      wallet,
      amount: participationFee,
      type: TransactionType.PARTICIPATE,
      status: TransactionStatus.PENDING, // Default status is PENDING
      proof_of_payment: null, // You can attach proof if available
    });

    await transactionRepository.save(transaction);

    // Add the user as a participant
    const auctionParticipant = auctionParticipantRepository.create({
      auction,
      user: { user_id },
    });

    await auctionParticipantRepository.save(auctionParticipant);

    sendSuccessResponse(res, { message: "Joined auction successfully" }, 201);
  } catch (error) {
    console.error("Error in joinAuction:", error);
    sendErrorResponse(res, "Internal server error");
  }
};
