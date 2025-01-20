import { Router } from "express";
import {
  loginController,
  registerController,
} from "../controllers/auth.controllers";
import createUserValidator from "../middlewares/userValidator/createUserValidator";
import loginUserValidator from "../middlewares/userValidator/loginUserValidator";

const authRouter = Router();

authRouter.post("/login", loginUserValidator, loginController);
authRouter.post("/register", createUserValidator, registerController);

export default authRouter;
