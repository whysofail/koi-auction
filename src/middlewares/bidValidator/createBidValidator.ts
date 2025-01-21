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

    const { bid_amount } = req.body;
    const { auction_id } = req.params;

    // Validate if auction_id is present
    if (!auction_id) {
      return res.status(400).json({ message: "Invalid auction ID!" });
    }
    // Validate if bid_amount is present
    if (!bid_amount) {
      return res.status(400).json({ message: "Bid amount is required!" });
    }

    // Parse the bid_amount to float and check for validity
    const bidAmount = parseFloat(bid_amount);
    if (Number.isNaN(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({
        message: "Bid amount must be a valid positive number",
      });
    }

    // Create a Bid instance to validate against
    const bid = new Bid();
    bid.bid_amount = bidAmount;

    // Perform class-validator validation
    const errors = await validate(bid);
    if (errors.length > 0) {
      // Map the errors into a readable format
      const validationErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // If validation is successful, proceed to the next middleware
    return next();
  } catch (e: any) {
    return res.status(500).json({ message: e.message });
  }
};

export default createBidValidator;
