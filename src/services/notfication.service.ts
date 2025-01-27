import { NotificationStatus } from "../entities/Notification";
import notificationRepository from "../repositories/notification.repository";
import { INotificationFilter } from "../types/entityfilter";
import { INotificationOrder } from "../types/entityorder.types";
import { PaginationOptions } from "../utils/pagination";
import { ErrorHandler } from "../utils/response/handleError";

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
    throw ErrorHandler.internalServerError(
      "Error fetching notifications",
      error,
    );
  }
};

const getNotificationById = async (notification_id: string) => {
  const notification =
    await notificationRepository.findNotificationById(notification_id);
  if (!notification) {
    throw ErrorHandler.notFound(
      `Notification with ID ${notification_id} not found`,
    );
  }
  return notification;
};

const getNotificationsByUserId = async (user_id: string) => {
  const notifications =
    await notificationRepository.findNotificationByUserId(user_id);
  if (!notifications) {
    throw ErrorHandler.notFound(
      `Notification with User ID ${user_id} not found`,
    );
  }
  return notifications;
};

const markNotificationAsRead = async (notification_id: string) => {
  const notification = await getNotificationById(notification_id);
  notification.status = NotificationStatus.READ;
  await notificationRepository.save(notification);
  return notification;
};

export const notificationService = {
  getNotifications,
  getNotificationById,
  getNotificationsByUserId,
  markNotificationAsRead,
};
