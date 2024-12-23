import { Router } from "express";
import {
  createAuction,
  getAuctionDetails,
  getAuctions,
} from "../controllers/auction.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/auction", getAuctions);
router.get("/auction/:auction_id", getAuctionDetails);
router.post("/auction", protect, authorize(["admin"]), createAuction);

export default router;
