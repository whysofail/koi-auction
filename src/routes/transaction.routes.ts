import { Router } from "express";
import { getTransactions } from "../controllers/transaction.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/transactions", protect, authorize(["admin"]), getTransactions);
router.get(
  "/transactions/me",
  protect,
  authorize(["user", "admin"]),
  getTransactions,
);
export default router;
