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
  userId: string,
) => {
  try {
    if (!userId) {
      throw ErrorHandler.badRequest("User ID is required");
    }

    const notification = await notificationRepository.findOne({
      where: { notification_id: notificationId },
      relations: ["user"],
    });

    if (!notification) {
      throw ErrorHandler.notFound(
        `Notification with ID ${notificationId} not found`,
      );
    }

    if (notification.user.user_id !== userId) {
      throw ErrorHandler.forbidden("You cannot mark this notification as read");
    }

    if (notification.status === NotificationStatus.READ) {
      return notification; // Already marked as read
    }

    // Update status
    await notificationRepository.update(notificationId, {
      status: NotificationStatus.READ,
    });

    return { ...notification, status: NotificationStatus.READ }; // Return updated object
  } catch (error) {
    throw ErrorHandler.internalServerError(
      "Error marking notification as read",
      error,
    );
  }
};

const markAllNotificationAsRead = async (userId: string) => {
  try {
    if (!userId) {
      throw ErrorHandler.badRequest("User ID is required");
    }

    const { affected } = await notificationRepository.update(
      { user: { user_id: userId }, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ },
    );

    if (!affected) {
      throw ErrorHandler.notFound("No unread notifications found");
    }

    return { message: `${affected} notifications marked as read` };
  } catch (error) {
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

    admins.users.forEach((admin, index) => {
      socketService.emitToAuthenticatedNamespace(
        admin.user_id,
        "update", // 🔄 Standardized event name
        { entity: "notification", data: adminNotifications[index] },
      );
    });

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
