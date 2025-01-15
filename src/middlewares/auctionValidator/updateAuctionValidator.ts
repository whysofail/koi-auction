import { Request, Response, NextFunction } from "express";
import { validate, isUUID, isDateString } from "class-validator";
import auctionRepository from "../../repositories/auction.repository";
import itemRepository from "../../repositories/item.repository";
import Item from "../../entities/Item";

const updateAuctionValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Missing request body!" });
      return;
    }

    const {
      item_id,
      title,
      description,
      reserve_price,
      start_datetime,
      end_datetime,
    } = req.body;
    const { auction_id } = req.params;

    // Validate auction_id (must be a valid UUID)
    if (!auction_id || !isUUID(auction_id)) {
      res.status(400).json({ message: "Invalid auction ID!" });
      return;
    }

    // Check if auction exists in the database
    const auction = await auctionRepository.findOne({ where: { auction_id } });
    if (!auction) {
      res.status(400).json({ message: "Auction not found!" });
      return;
    }

    // Validate item_id (if provided, must be a valid UUID and the item should exist)
    if (item_id && !isUUID(item_id)) {
      res.status(400).json({ message: "Invalid item ID!" });
      return;
    }

    // Check if item exists in the database (if item_id is provided)
    if (item_id) {
      const item = await itemRepository.findOne({ where: { item_id } });
      if (!item) {
        res.status(400).json({ message: "Item not found!" });
        return;
      }
    }

    // Validate required fields: title, description (only if they are provided)
    if (title && title.trim().length === 0) {
      res.status(400).json({ message: "Title must not be empty!" });
      return;
    }
    if (description && description.trim().length === 0) {
      res.status(400).json({ message: "Description must not be empty!" });
      return;
    }

    // Ensure reserve_price is a valid positive number, if provided
    let parsedReservePrice = reserve_price;
    if (reserve_price !== undefined && typeof reserve_price === "string") {
      parsedReservePrice = Number(reserve_price);
    }

    if (
      parsedReservePrice !== undefined &&
      (Number.isNaN(parsedReservePrice) || parsedReservePrice <= 0)
    ) {
      res
        .status(400)
        .json({ message: "Reserve price must be a valid positive number!" });
      return;
    }

    // Validate start_datetime and end_datetime (only if provided, ensure they are valid dates)
    if (start_datetime && !isDateString(start_datetime)) {
      res.status(400).json({ message: "Invalid start datetime!" });
      return;
    }
    if (end_datetime && !isDateString(end_datetime)) {
      res.status(400).json({ message: "Invalid end datetime!" });
      return;
    }

    // Ensure end_datetime is after start_datetime if both are provided
    if (
      start_datetime &&
      end_datetime &&
      new Date(end_datetime) <= new Date(start_datetime)
    ) {
      res
        .status(400)
        .json({ message: "End datetime must be after start datetime!" });
      return;
    }

    // Apply changes to auction object (only update provided fields)
    if (title) auction.title = title;
    if (description) auction.description = description;
    if (reserve_price !== undefined) auction.reserve_price = parsedReservePrice;
    if (start_datetime) auction.start_datetime = new Date(start_datetime);
    if (end_datetime) auction.end_datetime = new Date(end_datetime);
    if (item_id) {
      auction.item = new Item();
      auction.item.item_id = item_id; // Update item if item_id is provided
    }

    // Validate auction instance
    const errors = await validate(auction, { skipMissingProperties: true });
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

export default updateAuctionValidator;
