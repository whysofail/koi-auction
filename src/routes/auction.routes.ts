import { Router } from "express";
import {
  createAuction,
  getAuctionDetails,
  getAuctions,
  joinAuction,
  updateAuction,
} from "../controllers/auction.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";
import createAuctionValidator from "../middlewares/auctionValidator/createAuctionValidator";
import updateAuctionValidator from "../middlewares/auctionValidator/updateAuctionValidator";

const auctionRouter = Router();

auctionRouter.get("/", getAuctions);
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
auctionRouter.post("/:auction_id/join", protect, joinAuction);

export default auctionRouter;
