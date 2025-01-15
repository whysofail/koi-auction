import { Router } from "express";
import {
  loginController,
  refreshTokenController,
  registerController,
  revokeTokenController,
} from "../controllers/auth.controllers";
import createUserValidator from "../middlewares/userValidator/createUserValidator";
import loginUserValidator from "../middlewares/userValidator/loginUserValidator";
import refreshTokenValidator from "../middlewares/refreshTokenValidator/refreshTokenValidator";

const authRouter = Router();

authRouter.post("/login", loginUserValidator, loginController);
authRouter.post("/register", createUserValidator, registerController);
authRouter.post(
  "/refresh-token",
  refreshTokenValidator,
  refreshTokenController,
);
authRouter.delete(
  "/revoke-token",
  refreshTokenValidator,
  revokeTokenController,
);

export default authRouter;
