import { Router, Request, Response, NextFunction } from "express";
import userRouter from "./user.routes";
import auctionRouter from "./auction.routes";
import walletRouter from "./wallet.routes";
import transactionRouter from "./transaction.routes";
import bidRouter from "./bid.routes";
import authRouter from "./auth.routes";
import notificationRouter from "./notification.routes";
import warningRouter from "./warning.routes";
import { errorHandler } from "../utils/response/handleError";

const router = Router();

// Health check or welcome message route
router.get("/", (_, res) => {
  res.json({ message: "Welcome to the API" });
});

// Mounting the other routers
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/auctions", auctionRouter);
router.use("/wallets", walletRouter);
router.use("/transactions", transactionRouter);
router.use("/bids", bidRouter);
router.use("/notifications", notificationRouter);
router.use("/warnings", warningRouter);

// Catch-all route for undefined paths
router.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler middleware (make sure it's the last one!)
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next); // Pass the error to the handler
});

export default router;
