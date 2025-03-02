import { Request, Response } from "express";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { wishlistService } from "../services/wishlist.service";
import { sendSuccessResponse } from "../utils/response/handleResponse";

// Get All Wishlist from a user
export const getUserWishlists: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  const { user } = req as AuthenticatedRequest;
  const { pagination } = req;
  try {
    const { wishlists, count } = await wishlistService.getUserWishlists(
      user.user_id,
      pagination,
    );
    sendSuccessResponse(res, {
      data: wishlists,
      count,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  const { user } = req as AuthenticatedRequest;
  const { auction_id } = req.params;
  try {
    const wishlist = await wishlistService.addToWishlist(
      user.user_id,
      auction_id,
    );
    sendSuccessResponse(res, { data: wishlist }, 201);
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  const { user } = req as AuthenticatedRequest;
  const { auction_id } = req.params;
  try {
    const response = await wishlistService.removeFromWishlist(
      user.user_id,
      auction_id,
    );
    sendSuccessResponse(res, { data: response });
  } catch (error) {
    next(error);
  }
};
