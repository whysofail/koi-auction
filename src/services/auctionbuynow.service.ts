import { Not, In } from "typeorm";
import AuctionBuyNow, { AuctionBuyNowStatus } from "../entities/AuctionBuyNow";
import { ErrorHandler } from "../utils/response/handleError";
import { AuctionStatus } from "../entities/Auction";
import { notificationService } from "./notification.service";
import { NotificationType } from "../entities/Notification";
import auctionBuyNowRepository from "../repositories/auctionbuynow.repository";
import auctionRepository from "../repositories/auction.repository";

const createBuyNow = async (buyer_id: string, auction_id: string) => {
  const auction = await auctionRepository.findAuctionById(auction_id);
  if (!auction) {
    throw ErrorHandler.notFound("Auction not found or not active");
  }

  const existingBuyNow = await auctionBuyNowRepository.findBuyNowByAuctionId(
    auction_id,
    Not(In([AuctionBuyNowStatus.CANCELLED, AuctionBuyNowStatus.REFUNDED])),
  );

  if (existingBuyNow) {
    throw ErrorHandler.conflict("Buy now already exists for this auction");
  }

  const auctionBuyNow = new AuctionBuyNow();
  auctionBuyNow.buyer_id = buyer_id;
  auctionBuyNow.auction_id = auction_id;
  auctionBuyNow.status = AuctionBuyNowStatus.PENDING;

  const savedBuyNow = await auctionBuyNowRepository.save(auctionBuyNow);

  await notificationService.createNotification(
    buyer_id,
    NotificationType.AUCTION,
    `Your buy now request for auction ${auction.title} has been received`,
    auction.auction_id,
  );

  return savedBuyNow;
};
const completeBuyNow = async (auction_buynow_id: string, adminId: string) => {
  const buyNow =
    await auctionBuyNowRepository.findBuyNowById(auction_buynow_id);
  if (!buyNow) {
    throw ErrorHandler.notFound("Buy now transaction not found");
  }

  if (buyNow.status !== AuctionBuyNowStatus.PENDING) {
    throw ErrorHandler.conflict("Buy now transaction cannot be completed");
  }

  buyNow.status = AuctionBuyNowStatus.COMPLETED;
  if (adminId) buyNow.admin_id = adminId;

  const auction = await auctionRepository.findAuctionById(buyNow.auction_id);
  if (!auction) {
    throw ErrorHandler.notFound("Auction not found");
  }

  const savedBuyNow = await auctionBuyNowRepository.save(buyNow);

  await auctionRepository.updateAuctionStatus(buyNow.auction_id, {
    status: AuctionStatus.COMPLETED,
    winner_id: buyNow.buyer_id,
    final_price: auction.buynow_price,
  });

  await notificationService.createNotification(
    buyNow.buyer_id,
    NotificationType.AUCTION,
    `Your buy now transaction for auction ${buyNow.auction.title} has been completed`,
    buyNow.auction_id,
  );

  return savedBuyNow;
};
const cancelBuyNow = async (auction_buynow_id: string, adminId: string) => {
  const buyNow =
    await auctionBuyNowRepository.findBuyNowById(auction_buynow_id);
  if (!buyNow) {
    throw ErrorHandler.notFound("Buy now transaction not found");
  }

  if (buyNow.status !== AuctionBuyNowStatus.PENDING) {
    throw ErrorHandler.badRequest("Buy now transaction cannot be cancelled");
  }

  buyNow.status = AuctionBuyNowStatus.CANCELLED;
  if (adminId) buyNow.admin_id = adminId;

  const savedBuyNow = await auctionBuyNowRepository.save(buyNow);

  await notificationService.createNotification(
    buyNow.buyer_id,
    NotificationType.AUCTION,
    `Your buy now transaction for auction ${buyNow.auction.title} has been cancelled`,
    buyNow.auction_id,
  );

  return savedBuyNow;
};

const getBuyNow = async (auction_buynow_id: string) => {
  const buyNow =
    await auctionBuyNowRepository.findBuyNowById(auction_buynow_id);
  if (!buyNow) {
    throw ErrorHandler.notFound("Buy now transaction not found");
  }
  return buyNow;
};

export default { createBuyNow, completeBuyNow, cancelBuyNow, getBuyNow };
