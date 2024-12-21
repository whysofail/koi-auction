import { Request, Response, NextFunction } from "express";
import { validate, isUUID } from "class-validator";
import Item from "../../entities/Item";

const updateItemValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void | Response> => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Missing request body!" });
    }

    const { itemId } = req.params;
    if (!itemId || !isUUID(itemId)) {
      return res.status(400).json({ message: "Invalid item ID!" });
    }

    const item = new Item();
    item.item_id = itemId;

    // Handle string fields
    const stringFields = [
      "item_name",
      "item_description",
      "category",
      "condition",
    ];
    stringFields.forEach((field) => {
      if (field in req.body) {
        (item as any)[field] = req.body[field];
      }
    });

    // Handle price fields separately with validation
    if ("starting_price" in req.body) {
      const startingPrice = parseFloat(req.body.starting_price);
      if (Number.isNaN(startingPrice) || startingPrice <= 0) {
        return res.status(400).json({
          message: "Starting price must be a valid positive number",
        });
      }
      item.starting_price = startingPrice;
    }

    if ("reserve_price" in req.body) {
      const reservePrice = parseFloat(req.body.reserve_price);
      if (Number.isNaN(reservePrice) || reservePrice <= 0) {
        return res.status(400).json({
          message: "Reserve price must be a valid positive number",
        });
      }
      item.reserve_price = reservePrice;
    }

    // If both prices are being updated, check their relationship
    if (item.starting_price && item.reserve_price) {
      if (item.reserve_price < item.starting_price) {
        return res.status(400).json({
          message: "Reserve price cannot be less than starting price",
        });
      }
    }

    const errors = await validate(item, { skipMissingProperties: true });
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

export default updateItemValidator;
