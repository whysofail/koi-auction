import { Request, Response, NextFunction } from "express";
import { validate, isDateString } from "class-validator";
import auctionRepository from "../../repositories/auction.repository";

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
      item,
      title,
      description,
      reserve_price,
      bid_increment,
      start_datetime,
      end_datetime,
      status,
    } = req.body;
    const { auction_id } = req.params;

    // Validate auction_id (must be a valid UUID)
    if (!auction_id) {
      res.status(400).json({ message: "Invalid auction ID!" });
      return;
    }

    // Check if auction exists in the database
    const auction = await auctionRepository.findAuctionById(auction_id);
    if (!auction) {
      res.status(404).json({ message: "Auction not found!" });
      return;
    }

    // Validate item_id (if provided, must be a valid UUID and the item should exist)
    if (!item) {
      res.status(400).json({ message: "Invalid item ID!" });
      return;
    }

    if (item) {
      // If the item_id is being updated (not the same as the current auction's item_id)
      if (item !== auction.item) {
        // Check if item exists in the database

        const itemAlreadyExist = await auctionRepository.findOne({
          where: { item },
        });

        if (itemAlreadyExist) {
          res.status(400).json({ message: "Item already has an auction!" });
          return;
        }

        // Update item if valid
        auction.item = item;
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

    if (!status) {
      res.status(400).json({ message: "Status must not be empty" });
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

    // Ensure bid_increment is a valid positive number, if provided
    let parsedBidIncrement = bid_increment;
    if (bid_increment !== undefined && typeof bid_increment === "string") {
      parsedBidIncrement = Number(bid_increment);
    }

    if (
      parsedBidIncrement !== undefined &&
      (Number.isNaN(parsedBidIncrement) || parsedBidIncrement <= 0)
    ) {
      res
        .status(400)
        .json({ message: "Bid increment must be a valid positive number!" });
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
    if (bid_increment !== undefined) auction.bid_increment = parsedBidIncrement;
    if (start_datetime) auction.start_datetime = new Date(start_datetime);
    if (end_datetime) auction.end_datetime = new Date(end_datetime);
    if (status) auction.status = status.toUpperCase();

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
