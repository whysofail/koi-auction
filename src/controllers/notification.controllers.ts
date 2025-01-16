import { Request, Response } from "express";
import notificationRepository from "../repositories/notification.repository";
import { sendSuccessResponse } from "../utils/response/handleResponse";

// Get all notification
export const getNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [notifications, count] = await notificationRepository.findAndCount();
    sendSuccessResponse(res, { data: notifications, count }, 200);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create notification
export const createNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { user_id, type, message, reference_id } = req.body;

  try {
    const notification = await notificationRepository.createNotification(
      user_id,
      type,
      message,
      reference_id,
    );
    sendSuccessResponse(res, { data: notification }, 201);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get unread notifications
export const getUserNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.user_id;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  try {
    const [notifications, count] =
      await notificationRepository.findNotifications(userId);
    sendSuccessResponse(res, { data: notifications, count }, 200);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    return res.status(400).json({ message: "Notification ID is required" });
  }

  try {
    await notificationRepository.markNotificationAsRead(notificationId);
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ message: "Internal server error" });
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
