import { Router } from "express";
import {
  createAuction,
  deleteAuction,
  getAuctionDetails,
  getAuctions,
  joinAuction,
  leaveAuction,
  updateAuction,
} from "../controllers/auction.controllers";
import {
  createBuyNow,
  cancelBuyNow,
  completeBuyNow,
  getBuyNow,
  getBuyNowByAuctionId,
} from "../controllers/auctionbuynow.controllers";

import { getAuctionJoinedByUserId } from "../controllers/auctionparticipant.controllers";
import { parsePaginationAndFilters } from "../middlewares/parsePaginationFilter.middleware";
import { authorize, protect } from "../middlewares/auth.middleware";
import createAuctionValidator from "../middlewares/auctionValidator/createAuctionValidator";
import updateAuctionValidator from "../middlewares/auctionValidator/updateAuctionValidator";
import joinAuctionValidator from "../middlewares/auctionValidator/joinAuctionValidator";
import { deleteAuctionValidator } from "../middlewares/auctionValidator/deleteAuctionValidator";
import createAuctionBuyNowValidator from "../middlewares/auctionValidator/buyNowValidator";

const auctionRouter = Router();

auctionRouter.get("/", protect(false), parsePaginationAndFilters, getAuctions);
auctionRouter.post(
  "/",
  protect(),
  authorize(["admin"]),
  createAuctionValidator,
  createAuction,
);

auctionRouter.get(
  "/participated",
  protect(),
  parsePaginationAndFilters,
  getAuctionJoinedByUserId,
);

auctionRouter.get("/:auction_id", protect(false), getAuctionDetails);
auctionRouter.put(
  "/:auction_id",
  protect(),
  authorize(["admin"]),
  updateAuctionValidator,
  updateAuction,
);
auctionRouter.post(
  "/:auction_id/join",
  protect(),
  joinAuctionValidator,
  joinAuction,
);

auctionRouter.post("/:auction_id/leave", protect(), leaveAuction);

auctionRouter.delete(
  "/:auction_id",
  protect(),
  authorize(["admin"]),
  deleteAuctionValidator,
  deleteAuction,
);

auctionRouter.post(
  "/:auction_id/buynow",
  protect(),
  authorize(["user"]),
  createAuctionBuyNowValidator,
  createBuyNow,
);
auctionRouter.put(
  "/buynow/complete",
  protect(),
  authorize(["admin"]),
  completeBuyNow,
);
auctionRouter.put(
  "/buynow/cancel",
  protect(),
  authorize(["admin"]),
  cancelBuyNow,
);
auctionRouter.get("/buynow/:auction_buynow_id", protect(), getBuyNow);
auctionRouter.get("/buynow", protect(), parsePaginationAndFilters, getBuyNow);
auctionRouter.get(
  "/:auction_id/buynow",
  protect(),
  parsePaginationAndFilters,
  getBuyNowByAuctionId,
);

export default auctionRouter;
