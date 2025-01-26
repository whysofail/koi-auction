import { Request, Response, RequestHandler } from "express";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/response/handleResponse";
import { auctionService } from "../services/auction.service";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { AuctionOrderFields } from "../types/entityorder.types";

// Create Auction
export const createAuction: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;

  try {
    const auction = await auctionService.createAuction(req.body, user.user_id);
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
  next,
): Promise<void> => {
  try {
    const { filters, pagination, order } = req;
    const auctionOrder = {
      orderBy: order.orderBy as AuctionOrderFields,
      order: order.order,
    };
    const { auctions, count } = await auctionService.getAllAuctions(
      filters,
      pagination,
      auctionOrder,
    );
    sendSuccessResponse(res, {
      data: auctions,
      count,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    next(error);
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
    next(error);
  }
};

// Update Auction
export const updateAuction: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { auction_id } = req.params;
  const { user } = req as AuthenticatedRequest;

  try {
    const auction = await auctionService.updateAuction(
      auction_id,
      user.user_id,
      req.body,
    );
    sendSuccessResponse(res, auction);
  } catch (error) {
    next(error); // Pass the error to global error handler
  }
};

// Join Auction
export const joinAuction: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { auction_id } = req.params;
  const { user } = req as AuthenticatedRequest;

  try {
    await auctionService.joinAuction(auction_id, user.user_id);
    sendSuccessResponse(res, { message: "Joined auction successfully" }, 201);
  } catch (error) {
    next(error);
  }
};
