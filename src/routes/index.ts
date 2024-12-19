import { Router, Request, Response } from "express";
import { login, register } from "../controllers/auth.controllers";
import { protect, authorize } from "../middlewares/auth.middleware";
import userRouter from "./user.routes";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

const protectedRoute = (role: string) => [
  protect,
  authorize([role]),
  (req: Request, res: Response) => {
    res.json({ message: "Welcome to the API" });
  },
];

router.get("/protected/admin", ...protectedRoute("admin"));
router.get("/protected/user", ...protectedRoute("user"));

router.post("/login", login);
router.post("/register", register);
router.use(userRouter);

export default router;
