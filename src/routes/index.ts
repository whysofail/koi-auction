import { Router, Request, Response } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controllers";
import userRouter from "./user.routes";
import auctionRouter from "./auction.routes";
import walletRouter from "./wallet.routes";
import transactionRouter from "./transaction.routes";
import bidRouter from "./bid.routes";
import createUserValidator from "../middlewares/userValidator/createUserValidator";
import loginUserValidator from "../middlewares/userValidator/loginUserValidator";

const router = Router();

router.get("/", (_, res) => {
  res.json({ message: "Welcome to the API" });
});

router.post("/login", loginUserValidator, loginController);
router.post("/register", createUserValidator, registerController);
router.use("/users", userRouter);
router.use("/auctions", auctionRouter);
router.use("/wallets", walletRouter);
router.use("/transactions", transactionRouter);
router.use("/bids", bidRouter);

router.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

export default router;
