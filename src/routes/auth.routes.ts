import { Router } from "express";
import { login, register } from "../controllers/auth.controllers";
import loginUserValidator from "../middlewares/userValidator/loginUserValidator";
import createUserValidator from "../middlewares/userValidator/createUserValidator";

const router = Router();

router.post("/login", loginUserValidator, login);
router.post("/register", createUserValidator, register);

export default router;
