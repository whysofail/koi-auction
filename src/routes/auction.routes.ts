import { Router } from "express";
import {
  getAuctionDetails,
  getAuctions,
} from "../controllers/auction.controllers";

const router = Router();

router.get("/auction", getAuctions);
router.get("/auction/:auction_id", getAuctionDetails);

export default router;
