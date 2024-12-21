import { Request, Response, NextFunction } from "express";
import { validate, isUUID } from "class-validator";
import Auction from "../../entities/Auction";

const updateAuctionValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body!" });
    }

    const { auctionId } = req.params;
    if (!auctionId || !isUUID(auctionId)) {
      return res.status(400).json({ message: "Invalid auction ID!" });
    }

    const auction = new Auction();
    auction.auction_id = auctionId;

    const allowedField = ["title", "description", "status"];

    allowedField.forEach((field) => {
      if (field in req.body) {
        (auction as any)[field] = req.body[field];
      }
    });

    if ("current_highest_bid" in req.body) {
      const price = parseFloat(req.body.price);
      if (Number.isNaN(price) || price <= 0) {
        return res.status(400).json({
          message: "Price must be a valid positive number",
        });
      }
      auction.current_highest_bid = price;
    }

    const errors = await validate(auction, { skipMissingProperties: true });
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      });
    }

    next();
    return undefined;
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export default updateAuctionValidator;
