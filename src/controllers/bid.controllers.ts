import { Request, Response, RequestHandler } from "express";
import { FindOptionsWhere } from "typeorm";
import Bid from "../entities/Bid";
import buildDateRangeFilter from "../utils/date/dateRange";
import bidRepository from "../repositories/bid.repository";
import validateAndParseDates from "../utils/date/validateAndParseDate";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/response/handleResponse";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { bidService } from "../services/bid.service";

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
    const [bids, count] = await bidRepository.findAndCount({
      where: whereCondition,
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
  next,
) => {
  const { auction_id } = req.query as { auction_id: string };
  try {
    const bids = await bidService.getBidById(auction_id);
    sendSuccessResponse(res, { data: bids });
  } catch (error) {
    next(error);
  }
};

// Get a wallet by user ID
export const getBidByUserId: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  try {
    const { user } = req as AuthenticatedRequest;
    sendSuccessResponse(res, { data: user }, 200);
  } catch (error) {
    next(error);
  }
};

export const placeBid: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { auction_id } = req.params;
  const { bid_amount } = req.body;
  const { user } = req as AuthenticatedRequest;

  try {
    const bid = await bidService.placeBid(user.user_id, auction_id, bid_amount);
    sendSuccessResponse(res, { data: bid }, 201);
  } catch (error) {
    next(error);
  }
};
