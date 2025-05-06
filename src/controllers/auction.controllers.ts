import { NextFunction, Request, Response } from "express";
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
import * as XLSX from "xlsx";

import csvParser from "csv-parser";
import { Readable } from "stream";
import { validateAuctionInput } from "../middlewares/auctionValidator/validateAuctionInput";
import auctionRepository from "../repositories/auction.repository";
import { validateAuctionFile } from "../middlewares/auctionValidator/validateAuctionFile";

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
export const getAuctions: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  try {
    const { filters, pagination, order } = req;
    const { user } = req as AuthenticatedRequest;

    const auctionOrder = {
      orderBy: order.orderBy as AuctionOrderFields,
      order: order.order,
    };
    const { auctions, count } = await auctionService.getAllAuctions(
      filters,
      pagination,
      auctionOrder,
      user?.user_id,
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
export const getAuctionDetails: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { auction_id } = req.params;
  const { user } = req as AuthenticatedRequest; // Explicitly cast req

  try {
    const auction = await auctionService.getAuctionById(
      auction_id,
      user?.user_id, // Use optional chaining to prevent errors
    );
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
    next(error);
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

export const leaveAuction: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { auction_id } = req.params;
  const { user } = req as AuthenticatedRequest;

  try {
    await auctionService.leaveAuction(auction_id, user.user_id);
    sendSuccessResponse(res, { message: "Left auction successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteAuction: AuthenticatedRequestHandler = async (
  req,
  res,
  next,
) => {
  const { auction_id } = req.params;
  const { user } = req as AuthenticatedRequest;

  try {
    const auction = await auctionService.deleteAuction(
      auction_id,
      user.user_id,
    );
    sendSuccessResponse(res, auction);
  } catch (error) {
    next(error);
  }
};

export const bulkValidateAuctions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "CSV or XLSX file is required." });
      return;
    }

    const { validAuctions, invalidRows, totalRows } = await validateAuctionFile(
      req.file,
    );

    res.status(200).json({
      message: "Validation completed.",
      total: totalRows,
      valid: validAuctions.length,
      invalid: invalidRows.length,
      errors: invalidRows,
    });
  } catch (err) {
    next(err);
  }
};

export const bulkCreateAuctions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;
    console.log("Executing bulk create with user", user);
    if (!req.file) {
      res.status(400).json({ message: "CSV or XLSX file is required." });
      return;
    }

    const { validAuctions, invalidRows, totalRows } = await validateAuctionFile(
      req.file,
    );

    // Map validAuctions to include user_id
    const auctionsWithUserId = validAuctions.map((auction) => {
      return {
        ...auction,
        user_id: user.user_id, // Add user_id to each auction
      };
    });

    if (validAuctions.length > 0) {
      await auctionRepository.save(auctionsWithUserId);
    }

    res.status(200).json({
      message: "Bulk create completed.",
      total: totalRows,
      inserted: validAuctions.length,
      failed: invalidRows.length,
      errors: invalidRows,
    });
  } catch (err) {
    next(err);
  }
};
