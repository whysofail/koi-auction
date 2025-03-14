import { Request, Response, NextFunction } from "express";
import { In } from "typeorm";
import auctionRepository from "../../repositories/auction.repository";
import { AuctionStatus } from "../../entities/Auction";
import wishlistRepository from "../../repositories/wishlist.repository";
import { AuthenticatedRequest } from "../../types/auth";

const addToWishlistValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { auction_id } = req.params;
    const { user } = req as AuthenticatedRequest;

    if (!auction_id) {
      res.status(400).json({ message: "Auction ID is required!" });
      return;
    }
    // Check if auction exists in user's wishlist
    const existing = await wishlistRepository.findOne({
      where: {
        user: {
          user_id: user.user_id,
        },
        auction: {
          auction_id,
        },
      },
    });

    if (existing) {
      res.status(400).json({ message: "Auction already in wishlist" });
      return;
    }

    // Check if auction is available for wishlist
    const auction = await auctionRepository.findOne({
      where: {
        auction_id,
        status: In([AuctionStatus.PUBLISHED, AuctionStatus.STARTED]), // Only allow these statuses
      },
    });

    if (!auction) {
      res.status(400).json({
        message:
          "Auction is not available for wishlist! Only published or ongoing auctions can be added to wishlist.",
      });
      return;
    }

    next();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export default addToWishlistValidator;
