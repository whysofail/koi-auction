import { Router } from "express";
import {
  createAuction,
  getAuctionDetails,
  getAuctions,
  joinAuction,
  updateAuction,
} from "../controllers/auction.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/auctions", getAuctions);
router.get("/auction/:auction_id", getAuctionDetails);
router.post("/auction/:auction_id/join", protect, joinAuction);
router.post("/auction", protect, authorize(["admin"]), createAuction);
router.put(
  "/auction/:auction_id",
  protect,
  authorize(["admin"]),
  updateAuction,
);

export default router;
