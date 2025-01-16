import { Request, Response, NextFunction } from "express";
import { NotificationType } from "../../entities/Notification";
import userRepository from "../../repositories/user.repository";
import auctionRepository from "../../repositories/auction.repository";

const createNotificationValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Missing request body!" });
      return;
    }

    const requiredFields = ["user_id", "type", "message", "reference_id"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      res.status(400).json({
        message: "Missing required fields",
        missingFields,
      });
      return;
    }

    const { user_id, type, message, reference_id } = req.body;

    const user = await userRepository.findUserById(user_id);
    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
      return;
    }

    // Validate the type field is valid
    if (!Object.values(NotificationType).includes(type.toUpperCase())) {
      res.status(400).json({
        message: "Invalid notification type",
      });
      return;
    }

    // Optional: Validate message length
    if (message.length > 255) {
      res.status(400).json({
        message: "Message is too long (max 255 characters)",
      });
      return;
    }

    switch (type) {
      case NotificationType.AUCTION: {
        const auction = await auctionRepository.findAuctionById(reference_id);
        if (!auction) {
          res.status(400).json({
            message: "Auction not found",
          });
        }
        break;
      }
      default:
        break;
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

export default createNotificationValidator;
