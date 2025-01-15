import { Router } from "express";
import {
  getUserInfo,
  getAllUsers,
  updateUser,
} from "../controllers/user.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/", protect, authorize(["admin"]), getAllUsers);
userRouter.get("/me", protect, getUserInfo);
userRouter.put("/:id", protect, authorize(["user"]), updateUser);

export default userRouter;
