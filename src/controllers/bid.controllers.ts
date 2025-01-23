import { Request, Response, RequestHandler } from "express";
import { sendSuccessResponse } from "../utils/response/handleResponse";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { bidService } from "../services/bid.service";

export const getBids: RequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  try {
    const { filters, pagination } = req;
    const { bids, count } = await bidService.getAllBids(filters, pagination);

    sendSuccessResponse(res, {
      data: bids, // Place auctions directly inside data
      count,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    next(error);
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
