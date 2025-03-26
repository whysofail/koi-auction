import { Request, Response } from "express";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../utils/response/handleResponse";
import auctionbuynowService from "../services/auctionbuynow.service";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { AuctionBuyNowOrderFields } from "../types/entityorder.types";

export const createBuyNow: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { auction_id } = req.params;

    const buyNow = await auctionbuynowService.createBuyNow(
      user.user_id,
      auction_id,
    );

    sendSuccessResponse(res, { buyNow });
  } catch (error) {
    next(error);
  }
};

export const completeBuyNow: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  try {
    // Admin
    const { user } = req as AuthenticatedRequest;
    const { auction_buynow_id } = req.body;
    console.log("auction_buynow_id", auction_buynow_id);
    if (!auction_buynow_id) {
      sendErrorResponse(res, "auction_buynow_id is required", 400);
      return;
    }
    const buyNow = await auctionbuynowService.completeBuyNow(
      auction_buynow_id,
      user.user_id,
    );

    sendSuccessResponse(res, { buyNow });
  } catch (error) {
    next(error);
  }
};

export const cancelBuyNow: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  try {
    // Admin
    const { user } = req as AuthenticatedRequest;
    const { auction_buynow_id } = req.body;
    console.log("auction_buynow_id", auction_buynow_id);
    if (!auction_buynow_id) {
      sendErrorResponse(res, "auction_buynow_id is required", 400);
      return;
    }

    const buyNow = await auctionbuynowService.cancelBuyNow(
      auction_buynow_id,
      user.user_id,
    );

    sendSuccessResponse(res, { buyNow });
  } catch (error) {
    next(error);
  }
};

export const getBuyNow: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  try {
    const { filters, pagination, order } = req;

    const buyNowOrder = {
      orderBy: order.orderBy as AuctionBuyNowOrderFields,
      order: order.order,
    };

    const { buyNows, count } = await auctionbuynowService.getAllBuyNow(
      filters,
      pagination,
      buyNowOrder,
    );

    sendSuccessResponse(res, {
      buyNows,
      count,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    next(error);
  }
};

export const getBuyNowByAuctionId: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  try {
    const { auction_id } = req.params;

    console.log("auction_id", auction_id);

    const { buyNows, count } =
      await auctionbuynowService.getBuyNowByAuctionId(auction_id);

    sendSuccessResponse(res, { data: buyNows, count });
  } catch (error) {
    next(error);
  }
};
