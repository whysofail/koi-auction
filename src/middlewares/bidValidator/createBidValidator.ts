import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import Bid from "../../entities/Bid";
import { auctionService } from "../../services/auction.service";
import { AuctionStatus } from "../../entities/Auction";
import { AuthenticatedRequest } from "../../types/auth";
import auctionParticipantRepository from "../../repositories/auctionparticipant.repository";
// import bidRepository from "../../repositories/bid.repository"; // Import bid repository

const createBidValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Missing request body!" });
      return;
    }

    const { bid_amount } = req.body;
    const { auction_id } = req.params;
    const { user } = req as AuthenticatedRequest;

    if (!auction_id) {
      res.status(400).json({ message: "Invalid auction ID!" });
      return;
    }
    if (!bid_amount) {
      res.status(400).json({ message: "Bid amount is required!" });
      return;
    }

    const auction = await auctionService.getAuctionById(auction_id);

    const isJoined =
      await auctionParticipantRepository.isUserParticipatingInAuction(
        auction_id,
        user.user_id,
      );

    if (!isJoined) {
      res.status(400).json({ message: "User has not joined this auction!" });
      return;
    }

    if (auction.status !== AuctionStatus.STARTED) {
      res.status(400).json({ message: "Auction has not started yet!" });
      return;
    }

    const bidAmount = parseFloat(bid_amount);
    if (Number.isNaN(bidAmount) || bidAmount <= 0) {
      res.status(400).json({
        message: "Bid amount must be a valid positive number",
      });
      return;
    }

    const startingBid = Number(auction.bid_starting_price);
    const currentHighestBid = auction.current_highest_bid
      ? Number(auction.current_highest_bid)
      : null;
    const bidIncrement = Number(auction.bid_increment);

    let nextValidBid: number;

    if (currentHighestBid !== null) {
      nextValidBid = currentHighestBid + bidIncrement;
    } else {
      nextValidBid = startingBid;
    }

    if (
      bidAmount < nextValidBid ||
      (bidAmount - nextValidBid) % bidIncrement !== 0
    ) {
      res.status(400).json({
        message: `Bid amount must be at least ${nextValidBid} and follow the bid increment of ${bidIncrement}.`,
      });
      return;
    }

    // **🔹 Check if the user is the highest bidder**
    // const highestBid = await bidRepository.getHighestBid(auction_id); // Fetch highest bid record

    // if (highestBid && highestBid.user.user_id === user.user_id) {
    //   res.status(400).json({
    //     message: "You cannot outbid yourself!",
    //   });
    //   return;
    // }

    // Create a Bid instance to validate against
    const bid = new Bid();
    bid.bid_amount = bidAmount;

    // Perform class-validator validation
    const errors = await validate(bid);
    if (errors.length > 0) {
      const validationErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
      return;
    }

    next();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export default createBidValidator;
