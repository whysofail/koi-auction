import { Request, RequestHandler, Response } from "express";
import notificationRepository from "../repositories/notification.repository";
import { sendSuccessResponse } from "../utils/response/handleResponse";
import notificationSocket from "../sockets/notification.socket";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { notificationService } from "../services/notification.service";
import { INotificationOrder } from "../types/entityorder.types";

// Get all notification
export const getNotifications: RequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  try {
    const { filters, order, pagination } = req;
    const { notifications, count } = await notificationService.getNotifications(
      filters,
      order as INotificationOrder,
      pagination,
    );
    sendSuccessResponse(
      res,
      {
        data: notifications,
        count,
        page: pagination.page,
        limit: pagination.limit,
      },
      200,
    );
  } catch (error) {
    next(error);
  }
};

// Create notification
export const createNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { user_id, type, message, reference_id, role } = req.body;

  try {
    const notification = await notificationRepository.createNotification(
      user_id,
      type,
      message,
      reference_id,
      role,
    );
    await notificationSocket.send(user_id, "notification", notification);
    sendSuccessResponse(res, { data: notification }, 201);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread notifications
export const getUserNotifications: AuthenticatedRequestHandler = async (
  req,
  res,
  next,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  try {
    const { notifications, count } =
      await notificationService.getNotificationsByUserId(user.user_id);
    sendSuccessResponse(res, { data: notifications, count }, 200);
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
export const markNotificationAsRead: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { notification_id } = req.params;
  const { user } = req as AuthenticatedRequest;
  try {
    await notificationService.markNotificationAsRead(
      notification_id,
      user.user_id,
    );
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationAsRead: AuthenticatedRequestHandler = async (
  req,
  res,
  next,
) => {
  const { user } = req as AuthenticatedRequest;
  try {
    await notificationService.markAllNotificationAsRead(user.user_id);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

export const blastNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { type, message, reference_id } = req.body;
  try {
    const notifications = await notificationRepository.blastNotification(
      type,
      message,
      reference_id,
    );
    sendSuccessResponse(res, { data: notifications }, 201);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
