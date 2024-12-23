import { Request, Response, NextFunction } from "express";
import { validate, isUUID } from "class-validator";
import Bid from "../../entities/Bid";

const updateBidValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body!" });
    }

    const { bidId } = req.params;
    if (!bidId || !isUUID(bidId)) {
      return res.status(400).json({ message: "Invalid bid ID!" });
    }

    const bid = new Bid();
    bid.bid_id = bidId;

    if (req.body.bid_amount !== undefined) {
      const bidAmount = parseFloat(req.body.bid_amount);
      if (Number.isNaN(bidAmount) || bidAmount <= 0) {
        return res.status(400).json({
          message: "Bid amount must be a valid positive number",
        });
      }
      bid.bid_amount = bidAmount;
    }

    const errors = await validate(bid, { skipMissingProperties: true });
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
export default updateBidValidator;
