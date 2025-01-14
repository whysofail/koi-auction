import { Router } from "express";
import {
  createAuction,
  getAuctionDetails,
  getAuctions,
  joinAuction,
  updateAuction,
} from "../controllers/auction.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const auctionRouter = Router();

auctionRouter.get("/", getAuctions);
auctionRouter.post("/", protect, authorize(["admin"]), createAuction);
auctionRouter.get("/:auction_id", getAuctionDetails);
auctionRouter.put("/:auction_id", protect, authorize(["admin"]), updateAuction);
auctionRouter.post("/:auction_id/join", protect, joinAuction);

export default auctionRouter;
