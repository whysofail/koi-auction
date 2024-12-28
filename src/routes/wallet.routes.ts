import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  getAllWallets,
  getWalletById,
  getWalletByUserId,
  updateWallet,
} from "../controllers/wallet.controllers";

const router = Router();

router.get("/wallets", protect, authorize(["admin"]), getAllWallets);
router.get("/wallet/me", protect, authorize(["user"]), getWalletByUserId);
router.get("/wallet/:id", protect, authorize(["admin"]), getWalletById);
router.put("/wallet/:id", protect, authorize(["admin"]), updateWallet);

export default router;
