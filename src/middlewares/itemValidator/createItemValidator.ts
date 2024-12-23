import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import Item from "../../entities/Item";

const createItemValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body!" });
    }

    const item = new Item();

    // Required string fields
    if (
      !req.body.item_name ||
      !req.body.item_description ||
      !req.body.category
    ) {
      return res.status(400).json({
        message: "Item name, description, and category are required",
      });
    }

    item.item_name = req.body.item_name;
    item.item_description = req.body.item_description;
    item.category = req.body.category;

    // Validate prices
    const startingPrice = parseFloat(req.body.starting_price);
    const reservePrice = parseFloat(req.body.reserve_price);

    if (Number.isNaN(startingPrice) || startingPrice <= 0) {
      return res.status(400).json({
        message: "Starting price must be a valid positive number",
      });
    }

    if (Number.isNaN(reservePrice) || reservePrice <= 0) {
      return res.status(400).json({
        message: "Reserve price must be a valid positive number",
      });
    }

    if (reservePrice < startingPrice) {
      return res.status(400).json({
        message: "Reserve price cannot be less than starting price",
      });
    }

    item.starting_price = startingPrice;
    item.reserve_price = reservePrice;
    item.condition = req.body.condition || "new";

    const errors = await validate(item);
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

export default createItemValidator;
