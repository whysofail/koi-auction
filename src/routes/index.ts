import { Router, Request, Response } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controllers";
import { protect, authorize } from "../middlewares/auth.middleware";
import userRouter from "./user.routes";
import auctionRouter from "./auction.routes";
import walletRouter from "./wallet.routes";
import transactionRouter from "./transaction.routes";
import createUserValidator from "../middlewares/userValidator/createUserValidator";
import loginUserValidator from "../middlewares/userValidator/loginUserValidator";

const router = Router();

router.get("/", (_, res) => {
  res.json({ message: "Welcome to the API" });
});

const protectedRoute = (role: string) => [
  protect,
  authorize([role]),
  (req: Request, res: Response) => {
    res.json({ message: "Welcome to the API" });
  },
];

router.get("/protected/admin", ...protectedRoute("admin"));
router.get("/protected/user", ...protectedRoute("user"));

router.post("/login", loginUserValidator, loginController);
router.post("/register", createUserValidator, registerController);
router.use(userRouter);
router.use(auctionRouter);
router.use(walletRouter);
router.use(transactionRouter);

export default router;
