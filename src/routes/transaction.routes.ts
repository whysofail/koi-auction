import { Router } from "express";
import {
  getTransactions,
  updateTransactionStatus,
} from "../controllers/transaction.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const transactionRouter = Router();

transactionRouter.get("/", protect, authorize(["admin"]), getTransactions);
transactionRouter.get(
  "/me",
  protect,
  authorize(["user", "admin"]),
  getTransactions,
);
transactionRouter.post(
  "/",
  protect,
  authorize(["admin"]),
  updateTransactionStatus,
);
export default transactionRouter;
