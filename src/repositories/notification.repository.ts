import { AppDataSource as dataSource } from "../config/data-source";
import Notification, {
  NotificationStatus,
  NotificationType,
} from "../entities/Notification";
import User, { UserRole } from "../entities/User";
import userRepository from "./user.repository";

const notificationRepository = dataSource.getRepository(Notification).extend({
  createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    referenceId: string,
  ): Promise<Notification> {
    const notification = this.create({
      user: { user_id: userId },
      type,
      message,
      reference_id: referenceId,
      status: NotificationStatus.PENDING,
    });
    return this.save(notification);
  },
  async findNotifications(userId: string): Promise<[Notification[], number]> {
    return this.findAndCount({
      where: { user: { user_id: userId } },
      order: { created_at: "DESC" },
    });
  },

  markNotificationAsRead(notificationId: string) {
    return this.update(notificationId, {
      status: NotificationStatus.READ,
    });
  },
  blastNotification(
    type: NotificationType,
    message: string,
    referenceId: string,
  ): Promise<Notification[]> {
    return userRepository
      .find({ where: { role: UserRole.USER }, select: ["user_id"] })
      .then((users) => {
        const notifications = users.map((user: User) =>
          this.createNotification(user.user_id, type, message, referenceId),
        );
        return Promise.all(notifications);
      });
  },
});

export default notificationRepository;
