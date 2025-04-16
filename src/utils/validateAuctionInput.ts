// utils/validateAuctionInput.ts
import { validate, isDateString } from "class-validator";
import { In, Not } from "typeorm";
import Auction, { AuctionStatus } from "../entities/Auction";
import auctionRepository from "../repositories/auction.repository";

export const validateAuctionInput = async (data: Partial<Auction>) => {
  const {
    item,
    title,
    description,
    buynow_price,
    participation_fee,
    start_datetime,
    end_datetime,
    bid_increment,
    bid_starting_price,
  } = data;

  const errors: string[] = [];

  if (!item) errors.push("Invalid item!");

  if (item) {
    const itemAlreadyExist = await auctionRepository.findOne({
      where: {
        item,
        status: Not(
          In([
            AuctionStatus.DELETED,
            AuctionStatus.CANCELLED,
            AuctionStatus.EXPIRED,
            AuctionStatus.FAILED,
          ]),
        ),
      },
      withDeleted: true,
    });

    if (itemAlreadyExist) {
      errors.push("Item already listed in another auction.");
    }
  }

  if (!title || title.trim() === "") errors.push("Title must not be empty.");
  if (!description || description.trim() === "")
    errors.push("Description must not be empty.");
  if (!start_datetime || !isDateString(start_datetime))
    errors.push("Invalid start datetime.");
  if (!end_datetime || !isDateString(end_datetime))
    errors.push("Invalid end datetime.");
  if (!bid_increment || Number(bid_increment) <= 0)
    errors.push("Bid increment must be a valid positive number.");
  if (!buynow_price || Number(buynow_price) <= 0)
    errors.push("Buy now price must be a valid positive number.");
  if (!participation_fee || Number(participation_fee) <= 0)
    errors.push("Participation fee must be a valid positive number.");
  if (!bid_starting_price || Number(bid_starting_price) <= 0)
    errors.push("Bid starting price must be a valid positive number.");

  const start = new Date(start_datetime ?? "");
  const end = new Date(end_datetime ?? "");
  const now = new Date();
  const oneHourMs = 60 * 60 * 1000;

  if (start.getTime() <= now.getTime() - oneHourMs) {
    errors.push("Start datetime must be in the future.");
  }

  if (end.getTime() <= start.getTime()) {
    errors.push("End datetime must be after start datetime.");
  }

  const auction = new Auction();
  auction.title = title!;
  auction.description = description!;
  auction.item = item!;
  auction.buynow_price = Number(buynow_price);
  auction.bid_increment = Number(bid_increment);
  auction.participation_fee = Number(participation_fee);
  auction.bid_starting_price = Number(bid_starting_price);
  auction.start_datetime = start;
  auction.end_datetime = end;

  const classValidatorErrors = await validate(auction, {
    skipMissingProperties: true,
  });

  if (classValidatorErrors.length > 0) {
    classValidatorErrors.forEach((e) => {
      if (e.constraints) {
        errors.push(...Object.values(e.constraints));
      }
    });
  }

  return { isValid: errors.length === 0, errors, auction };
};
