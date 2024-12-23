import { Router } from "express";
import { getUserInfo, getAllUsers } from "../controllers/user.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/user/", protect, authorize(["admin"]), getAllUsers);
router.get("/user/info", protect, getUserInfo);

export default router;
