import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import Auction, { AuctionStatus } from "../../entities/Auction";

const createAuctionValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body!" });
    }

    const auction = new Auction();
    auction.item = req.body.item;
    auction.status = req.body.status || AuctionStatus.PENDING;

    // Additional validation for dates
    if (auction.end_datetime <= auction.start_datetime) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const errors = await validate(auction);
    if (errors.length > 0) {
      return res.status(400).json({ message: `Validation failed: ${errors}` });
    }

    next();
    return undefined;
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export default createAuctionValidator;
