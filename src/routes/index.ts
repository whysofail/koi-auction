import { Router, Request, Response } from "express";
import userRouter from "./user.routes";
import auctionRouter from "./auction.routes";
import walletRouter from "./wallet.routes";
import transactionRouter from "./transaction.routes";
import bidRouter from "./bid.routes";
import authRouter from "./auth.routes";

const router = Router();

router.get("/", (_, res) => {
  res.json({ message: "Welcome to the API" });
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/auctions", auctionRouter);
router.use("/wallets", walletRouter);
router.use("/transactions", transactionRouter);
router.use("/bids", bidRouter);

router.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

export default router;
