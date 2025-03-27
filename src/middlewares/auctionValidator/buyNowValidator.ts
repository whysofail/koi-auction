import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { In, Not } from "typeorm";
import AuctionBuyNow, {
  AuctionBuyNowStatus,
} from "../../entities/AuctionBuyNow";
import auctionBuyNowRepository from "../../repositories/auctionbuynow.repository";
import auctionRepository from "../../repositories/auction.repository";
import { AuthenticatedRequest } from "../../types/auth";

const createAuctionBuyNowValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { user } = req as AuthenticatedRequest;
    const buyer_id = user.user_id;

    if (!req.body) {
      res.status(400).json({ message: "Missing request body!" });
      return;
    }

    const { auction_id } = req.params;
    const { transaction_reference } = req.body;

    if (!auction_id) {
      res.status(400).json({ message: "Auction ID is required!" });
      return;
    }

    // Validate auction existence
    const auction = await auctionRepository.findOne({
      where: {
        auction_id,
        status: Not(In(["DELETED", "CANCELLED", "EXPIRED", "FAILED"])),
      },
    });

    if (!auction) {
      res.status(404).json({ message: "Auction not found or not active!" });
      return;
    }

    // Check for existing buy now for this auction
    const existingBuyNow = await auctionBuyNowRepository.findOne({
      where: { auction_id, buyer_id },
    });

    if (existingBuyNow) {
      res
        .status(400)
        .json({ message: "Buy now already exists for this auction!" });
      return;
    }

    if (!buyer_id) {
      res.status(400).json({ message: "Buyer ID is required!" });
      return;
    }

    // Create AuctionBuyNow object
    const auctionBuyNow = new AuctionBuyNow();
    auctionBuyNow.auction_id = auction_id;
    auctionBuyNow.buyer_id = buyer_id;
    auctionBuyNow.transaction_reference = transaction_reference;
    auctionBuyNow.status = AuctionBuyNowStatus.PENDING;

    // Validate auction buy now instance
    const errors = await validate(auctionBuyNow, {
      skipMissingProperties: true,
    });
    if (errors.length > 0) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      });
      return;
    }

    // Proceed to the next middleware if validation passes
    next();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export default createAuctionBuyNowValidator;
