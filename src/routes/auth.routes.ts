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

authRouter.post("/auth/login", loginUserValidator, loginController);
authRouter.post("/auth/register", createUserValidator, registerController);
authRouter.post(
  "/auth/refresh-token",
  refreshTokenValidator,
  refreshTokenController,
);
authRouter.post(
  "/auth/revoke-token",
  refreshTokenValidator,
  revokeTokenController,
);

export default authRouter;
