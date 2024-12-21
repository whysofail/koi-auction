import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import Bid from "../../entities/Bid";

const createBidValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body!" });
    }

    const bid = new Bid();
    if (req.body.bid_amount !== undefined) {
      const bidAmount = parseFloat(req.body.bid_amount);
      if (Number.isNaN(bidAmount) || bidAmount <= 0) {
        return res.status(400).json({
          message: "Bid amount must be a valid positive number",
        });
      }
      bid.bid_amount = bidAmount;
    }

    const errors = await validate(bid);
    if (errors.length > 0) {
      return res.status(400).json({ message: `Validation failed: ${errors}` });
    }

    next();
    return undefined;
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export default createBidValidator;
