import { Router } from "express";
import { authorize, protect } from "../middlewares/auth.middleware";
import {
  createDeposit,
  getAllWallets,
  getWalletById,
  getWalletByUserId,
  updateWallet,
} from "../controllers/wallet.controllers";
import { uploadProofOfPayment } from "../middlewares/upload.middleware"; // Import the multer middleware

const router = Router();

router.get("/wallets", protect, authorize(["admin"]), getAllWallets);
router.get("/wallet/me", protect, authorize(["user"]), getWalletByUserId);
router.get("/wallet/:id", protect, authorize(["admin"]), getWalletById);
router.put("/wallet/:id", protect, authorize(["admin"]), updateWallet);
router.post(
  "/wallet/deposit",
  protect,
  authorize(["user"]),
  uploadProofOfPayment,
  createDeposit,
);

export default router;
