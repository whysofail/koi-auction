import { Router } from "express";
import {
  getUserInfo,
  getAllUsers,
  updateUser,
} from "../controllers/user.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";
import { parsePaginationAndFilters } from "../middlewares/parsePaginationFilter.middleware";

const userRouter = Router();

userRouter.get(
  "/",
  protect,
  parsePaginationAndFilters,
  authorize(["admin"]),
  getAllUsers,
);
userRouter.get("/me", protect, getUserInfo);
userRouter.put("/:id", protect, authorize(["user"]), updateUser);

export default userRouter;
