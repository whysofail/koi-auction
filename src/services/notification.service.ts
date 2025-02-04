import {
  NotificationRole,
  NotificationStatus,
  NotificationType,
} from "../entities/Notification";
import notificationRepository from "../repositories/notification.repository";
import { INotificationFilter } from "../types/entityfilter";
import { INotificationOrder } from "../types/entityorder.types";
import { PaginationOptions } from "../utils/pagination";
import { ErrorHandler } from "../utils/response/handleError";
import socketService from "./socket.service";
import { userService } from "./user.service";

const getNotifications = async (
  filters?: INotificationFilter,
  order?: INotificationOrder,
  pagination?: PaginationOptions,
) => {
  try {
    const { notifications, count } =
      await notificationRepository.findAllNotifications(
        filters,
        order,
        pagination,
      );
    return { notifications, count };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw ErrorHandler.internalServerError(
      "Error fetching notifications",
      error,
    );
  }
};

const createNotification = async (
  user_id: string,
  type: NotificationType,
  message: string,
  reference_id: string,
  role: NotificationRole,
) => {
  try {
    const notification = await notificationRepository.createNotification(
      user_id,
      type,
      message,
      reference_id,
      role,
    );

    await socketService.emitToUser(user_id, "user", notification);

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw ErrorHandler.internalServerError(
      "Error creating notification",
      error,
    );
  }
};

const getNotificationById = async (notification_id: string) => {
  try {
    const notification =
      await notificationRepository.findNotificationById(notification_id);
    if (!notification) {
      throw ErrorHandler.notFound(
        `Notification with ID ${notification_id} not found`,
      );
    }
    return notification;
  } catch (error) {
    console.error(
      `Error fetching notification by ID (${notification_id}):`,
      error,
    );
    throw ErrorHandler.internalServerError(
      "Error fetching notification",
      error,
    );
  }
};

const getNotificationsByUserId = async (user_id: string) => {
  try {
    const { notifications, count } =
      await notificationRepository.findAllNotifications({ userId: user_id });
    if (!notifications) {
      throw ErrorHandler.notFound(
        `Notifications for User ID ${user_id} not found`,
      );
    }
    return { notifications, count };
  } catch (error) {
    console.error(
      `Error fetching notifications for user ID (${user_id}):`,
      error,
    );
    throw ErrorHandler.internalServerError(
      "Error fetching user notifications",
      error,
    );
  }
};

const markNotificationAsRead = async (
  notificationId: string,
  user_id: string, // Add user_id to check ownership
) => {
  try {
    const notification = await notificationRepository.findNotification({
      notificationId,
    });

    if (!user_id) {
      throw ErrorHandler.badRequest("User ID is required");
    }

    if (!notification) {
      throw ErrorHandler.notFound(
        `Notification with ID ${notificationId} not found`,
      );
    }

    // Check if the user is the owner of the notification
    if (notification.user.user_id !== user_id) {
      throw ErrorHandler.forbidden(
        "Forbidden. You cannot mark this notification as read",
      );
    }

    // Check if the notification is already marked as read
    if (notification.status === NotificationStatus.READ) {
      throw ErrorHandler.badRequest("Notification is already marked as read");
    }

    // Mark the notification as read
    notification.status = NotificationStatus.READ;
    await notificationRepository.save(notification);

    return notification;
  } catch (error) {
    if (error instanceof ErrorHandler) {
      throw error;
    } else {
      throw ErrorHandler.internalServerError(
        "Error marking notification as read",
        error,
      );
    }
  }
};

const markAllNotificationAsRead = async (userId: string) => {
  try {
    const { notifications } = await notificationRepository.findAllNotifications(
      {
        userId,
      },
    );
    if (notifications.length === 0) {
      throw ErrorHandler.notFound("No notifications found for this user");
    }
    const updatedNotifications = await Promise.all(
      notifications.map((notif) => {
        const updatedNotification = {
          ...notif,
          status: NotificationStatus.READ,
        };
        return notificationRepository.save(updatedNotification);
      }),
    );
    return updatedNotifications;
  } catch (error) {
    console.error(
      `Error marking all notifications as read for user (${userId}):`,
      error,
    );
    throw ErrorHandler.internalServerError(
      "Error marking all notifications as read",
      error,
    );
  }
};

const sendNotificationToAdmins = async (
  type: NotificationType,
  message: string,
  reference_id: string,
  role: NotificationRole,
) => {
  try {
    const admins = await userService.getAllUsers({ role: "admin" });
    const adminNotifications = await Promise.all(
      admins.users.map((admin) =>
        createNotification(admin.user_id, type, message, reference_id, role),
      ),
    );
    const lastAdminNotification =
      adminNotifications[adminNotifications.length - 1];
    await socketService.emitToAdminRoom(lastAdminNotification);
    return adminNotifications;
  } catch (error) {
    console.error("Error sending notifications to admins:", error);
    throw ErrorHandler.internalServerError(
      "Error sending notifications to admins",
      error,
    );
  }
};

export const notificationService = {
  getNotifications,
  getNotificationById,
  getNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationAsRead,
  createNotification,
  sendNotificationToAdmins,
};
