import { Request, Response, RequestHandler } from "express";
import { FindOptionsWhere } from "typeorm";
import Auction, { AuctionStatus } from "../entities/Auction";
import paginate from "../utils/pagination";
import buildDateRangeFilter from "../utils/date/dateRange";
import auctionRepository from "../repositories/auction.repository";
import validateAndParseDates from "../utils/date/validateAndParseDate";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/response/handleResponse";
import { auctionService } from "../services/auction.service";

// Create Auction
export const createAuction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user_id = req.user?.user_id ?? "";

  try {
    console.log("Creating auction:", req.body); // Debug log
    const auction = await auctionService.createAuction(req.body, user_id);
    sendSuccessResponse(res, { data: auction }, 201);
  } catch (error) {
    console.error("Error creating auction:", error);
    sendErrorResponse(res, "Internal server error");
  }
};

// Get all auctions
export const getAuctions: RequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status, date_column } = req.query;

    const {
      valid,
      start_datetime: parsedStartDate,
      end_datetime: parsedEndDate,
    } = validateAndParseDates(req, res);

    if (!valid) return; // If date validation fails, return early

    const dateRangeFilter = buildDateRangeFilter<Auction>(
      (date_column ?? "created_at") as keyof Auction,
      {
        start_datetime: parsedStartDate?.toISOString(),
        end_datetime: parsedEndDate?.toISOString(),
      },
    );

    const whereCondition: FindOptionsWhere<Auction> = {
      ...dateRangeFilter,
    };

    if (status) {
      whereCondition.status = String(status).toUpperCase() as AuctionStatus;
    }

    const [auctions, count] = await auctionRepository.findAndCount({
      where: whereCondition,
      ...paginate(req.query),
      relations: ["item", "user", "bids"],
    });

    sendSuccessResponse(res, { data: auctions, count });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    sendErrorResponse(res, "Internal server error");
  }
};

// Get auction details by ID
export const getAuctionDetails: RequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { auction_id } = req.params;
  try {
    const auction = await auctionService.getAuctionById(auction_id);
    sendSuccessResponse(res, { data: [auction] });
  } catch (error) {
    console.error("Error fetching auction details:", error);
    next(error);
  }
};

// Update Auction
export const updateAuction: RequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { auction_id } = req.params;
  const user_id = req.user?.user_id ?? "";

  try {
    const auction = await auctionService.updateAuction(
      auction_id,
      user_id,
      req.body,
    );
    sendSuccessResponse(res, auction);
  } catch (error) {
    console.error("Error updating auction:", error);
    next(error); // Pass the error to global error handler
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
    await auctionService.joinAuction(auction_id, user_id);
    sendSuccessResponse(res, { message: "Joined auction successfully" }, 201);
  } catch (error) {
    console.error("Error in joinAuction:", error);
    sendErrorResponse(res, "Internal server error");
  }
};
