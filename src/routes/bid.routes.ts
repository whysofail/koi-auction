import { Router } from "express";
import {
  getBids,
  getBidsByAuctionId,
  getBidByUserId,
  placeBid,
} from "../controllers/bid.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const bidRouter = Router();

bidRouter.get("/", protect, authorize(["admin"]), getBids);
bidRouter.get("/me", protect, getBidByUserId);
bidRouter.get("/auction/:auction_id", getBidsByAuctionId);
bidRouter.post("/:auction_id", protect, placeBid);

export default bidRouter;
