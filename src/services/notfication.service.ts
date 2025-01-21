import { NotificationStatus } from "../entities/Notification";
import notificationRepository from "../repositories/notification.repository";
import { ErrorHandler } from "../utils/response/handleError";

const getNotifications = async () => {
  try {
    const [notifications, count] = await notificationRepository.findAndCount();
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
