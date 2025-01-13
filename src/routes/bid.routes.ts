import { Router } from "express";
import {
  getBids,
  getBidsByAuctionId,
  getBidByUserId,
  placeBid,
} from "../controllers/bid.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/bids", protect, authorize(["admin"]), getBids);
router.get("/bids/me", protect, getBidByUserId);
router.get("/bid/auction/:auction_id", getBidsByAuctionId);
router.post("/bid/:auction_id", protect, placeBid);

export default router;
