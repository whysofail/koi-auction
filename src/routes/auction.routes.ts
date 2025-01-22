import { Router } from "express";
import {
  createAuction,
  getAuctionDetails,
  getAuctions,
  joinAuction,
  updateAuction,
} from "../controllers/auction.controllers";
import { parsePaginationAndFilters } from "../middlewares/parsePaginationFilter.middleware";
import { authorize, protect } from "../middlewares/auth.middleware";
import createAuctionValidator from "../middlewares/auctionValidator/createAuctionValidator";
import updateAuctionValidator from "../middlewares/auctionValidator/updateAuctionValidator";
import joinAuctionValidator from "../middlewares/auctionValidator/joinAuctionValidator";

const auctionRouter = Router();

auctionRouter.get("/", parsePaginationAndFilters, getAuctions);
auctionRouter.post(
  "/",
  protect,
  authorize(["admin"]),
  createAuctionValidator,
  createAuction,
);
auctionRouter.get("/:auction_id", getAuctionDetails);
auctionRouter.put(
  "/:auction_id",
  protect,
  authorize(["admin"]),
  updateAuctionValidator,
  updateAuction,
);
auctionRouter.post(
  "/:auction_id/join",
  protect,
  joinAuctionValidator,
  joinAuction,
);

export default auctionRouter;
