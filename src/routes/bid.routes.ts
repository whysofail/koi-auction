import { Router } from "express";
import {
  getBids,
  getBidsByAuctionId,
  placeBid,
} from "../controllers/bid.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/bids", getBids);
router.get("/bid/auction/:auction_id", getBidsByAuctionId);
router.post("/bid/:auction_id", protect, placeBid);

export default router;
