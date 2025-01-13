import { Router } from "express";
import {
  getTransactions,
  updateTransactionStatus,
} from "../controllers/transaction.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/transactions", protect, authorize(["admin"]), getTransactions);
router.get(
  "/transactions/me",
  protect,
  authorize(["user", "admin"]),
  getTransactions,
);

router.post(
  "/transactions",
  protect,
  authorize(["admin"]),
  updateTransactionStatus,
);
export default router;
