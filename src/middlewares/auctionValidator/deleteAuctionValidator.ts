import { Request, Response, NextFunction } from "express";
import { AuctionStatus } from "../../entities/Auction";
import { auctionService } from "../../services/auction.service";

export const deleteAuctionValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { auction_id } = req.params;

    if (!auction_id) {
      res.status(400).json({ message: "Invalid auction ID!" });
      return;
    }

    const auction = await auctionService.getAuctionById(auction_id);
    if (!auction) {
      res.status(404).json({ message: "Auction not found!" });
      return;
    }

    const allowedStatus = [
      AuctionStatus.DRAFT,
      AuctionStatus.CANCELLED,
      AuctionStatus.PUBLISHED,
    ];
    if (!allowedStatus.includes(auction.status)) {
      res.status(400).json({ message: "Auction cannot be deleted!" });
    }

    next();
  } catch (error) {
    next(error);
  }
};
