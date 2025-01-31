import { Request, Response, NextFunction } from "express";
import { validate, isDateString } from "class-validator";
import auctionRepository from "../../repositories/auction.repository";
import { AuctionStatus } from "../../entities/Auction";

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

    const { auction_id } = req.params;

    // Validate auction_id
    if (!auction_id) {
      res.status(400).json({ message: "Invalid auction ID!" });
      return;
    }

    // Fetch existing auction
    const auction = await auctionRepository.findAuctionById(auction_id);
    if (!auction) {
      res.status(404).json({ message: "Auction not found!" });
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

    // Validate and update `item`
    if (item && item !== auction.item) {
      const itemAlreadyExist = await auctionRepository.findOne({
        where: { item },
      });
      if (itemAlreadyExist) {
        res.status(400).json({ message: "Item already has an auction!" });
        return;
      }
      auction.item = item;
    }

    // Validate and update `title` and `description`
    if (title !== undefined && title.trim().length === 0) {
      res.status(400).json({ message: "Title must not be empty!" });
      return;
    }
    if (description !== undefined && description.trim().length === 0) {
      res.status(400).json({ message: "Description must not be empty!" });
      return;
    }
    if (title) auction.title = title;
    if (description) auction.description = description;

    // Validate and update `reserve_price`
    if (reserve_price !== undefined) {
      const parsedReservePrice = Number(reserve_price);
      if (Number.isNaN(parsedReservePrice) || parsedReservePrice <= 0) {
        res
          .status(400)
          .json({ message: "Reserve price must be a valid positive number!" });
        return;
      }
      auction.reserve_price = parsedReservePrice;
    }

    // Validate and update `bid_increment`
    if (bid_increment !== undefined) {
      const parsedBidIncrement = Number(bid_increment);
      if (Number.isNaN(parsedBidIncrement) || parsedBidIncrement <= 0) {
        res
          .status(400)
          .json({ message: "Bid increment must be a valid positive number!" });
        return;
      }
      auction.bid_increment = parsedBidIncrement;
    }

    // Validate and update `start_datetime` and `end_datetime`
    if (start_datetime && !isDateString(start_datetime)) {
      res.status(400).json({ message: "Invalid start datetime!" });
      return;
    }
    if (end_datetime && !isDateString(end_datetime)) {
      res.status(400).json({ message: "Invalid end datetime!" });
      return;
    }

    const startDt = start_datetime ? new Date(start_datetime) : undefined;
    const endDt = end_datetime ? new Date(end_datetime) : undefined;

    // UTC-7 Time Zone Offset (7 hours in milliseconds)
    const timezoneOffset = 7 * 60 * 60 * 1000;

    // Adjust start datetime to UTC-7
    if (startDt) {
      startDt.setTime(startDt.getTime() - timezoneOffset);
    }

    // Adjust end datetime to UTC-7
    if (endDt) {
      endDt.setTime(endDt.getTime() - timezoneOffset);
    }

    // Ensure start datetime is in the future
    if (startDt && startDt.getTime() <= new Date().getTime()) {
      res
        .status(400)
        .json({ message: "Start datetime must be in the future!" });
      return;
    }

    // Ensure end datetime is after start datetime
    if (startDt && endDt && endDt.getTime() <= startDt.getTime()) {
      res
        .status(400)
        .json({ message: "End datetime must be after start datetime!" });
      return;
    }

    if (startDt) auction.start_datetime = startDt;
    if (endDt) auction.end_datetime = endDt;

    // Validate and update `status`
    if (status !== undefined) {
      if (typeof status !== "string" || status.trim().length === 0) {
        res.status(400).json({ message: "Status must not be empty!" });
        return;
      }
      auction.status = status.toUpperCase() as AuctionStatus;
    }

    // Validate the updated auction object
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

    next();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export default updateAuctionValidator;
