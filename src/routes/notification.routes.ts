import { Router } from "express";
import {
  blastNotification,
  createNotification,
  getNotifications,
  getUserNotifications,
} from "../controllers/notification.controllers";
import { authorize, protect } from "../middlewares/auth.middleware";
import createNotificationValidator from "../middlewares/notificationValidator/createNotificationValidator";
import { parsePaginationAndFilters } from "../middlewares/parsePaginationFilter.middleware";

const notificationRouter = Router();

notificationRouter.get(
  "/",
  protect,
  authorize(["admin"]),
  parsePaginationAndFilters,
  getNotifications,
);
notificationRouter.post(
  "/",
  protect,
  authorize(["admin"]),
  createNotificationValidator,
  createNotification,
);
notificationRouter.get(
  "/me",
  protect,
  authorize(["user", "admin"]),
  getUserNotifications,
);

notificationRouter.post(
  "/blast",
  protect,
  authorize(["admin"]),
  blastNotification,
);

export default notificationRouter;
