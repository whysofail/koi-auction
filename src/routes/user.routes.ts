import { Router } from "express";
import {
  getUserInfo,
  getAllUsers,
  updateUser,
} from "../controllers/user.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/user/", protect, authorize(["admin"]), getAllUsers);
router.get("/user/me", protect, getUserInfo);
router.put("/user/:id", protect, authorize(["user"]), updateUser);

export default router;
