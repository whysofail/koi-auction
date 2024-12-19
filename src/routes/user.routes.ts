import { Router } from "express";
import getUserInfo from "../controllers/user.controllers";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/user/info", protect, getUserInfo);

export default router;
