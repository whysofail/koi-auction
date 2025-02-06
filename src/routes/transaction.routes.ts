import { Router } from "express";
import {
  getTransactionById,
  getTransactions,
  getUserTransactions,
  updateTransactionStatus,
} from "../controllers/transaction.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";
import { parsePaginationAndFilters } from "../middlewares/parsePaginationFilter.middleware";

const transactionRouter = Router();

transactionRouter.get(
  "/",
  protect,
  authorize(["admin"]),
  parsePaginationAndFilters,
  getTransactions,
);

transactionRouter.get(
  "/:id",
  protect,
  authorize(["user", "admin"]),
  getTransactionById,
);

transactionRouter.get(
  "/me",
  protect,
  authorize(["user", "admin"]),
  parsePaginationAndFilters,
  getUserTransactions,
);
transactionRouter.post(
  "/",
  protect,
  authorize(["admin"]),
  updateTransactionStatus,
);
export default transactionRouter;
