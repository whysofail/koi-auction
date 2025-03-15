import { SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import Notification, {
  NotificationRole,
  NotificationStatus,
  NotificationType,
} from "../entities/Notification";
import User, { UserRole } from "../entities/User";
import userRepository from "./user.repository";
import { INotificationFilter } from "../types/entityfilter";
import { applyPagination, PaginationOptions } from "../utils/pagination";
import { INotificationOrder } from "../types/entityorder.types";

const applyNotificationOrdering = (
  qb: SelectQueryBuilder<Notification>,
  order?: INotificationOrder,
) => {
  if (!order || !order.orderBy) {
    qb.addOrderBy("notification.created_at", "DESC");
    return qb;
  }

  if (order.orderBy === "created_at") {
    qb.orderBy("notification.created_at", order.order);
  }

  if (order.orderBy === "type") {
    qb.orderBy("notification.type", order.order);
  }

  if (order.orderBy === "status") {
    qb.orderBy("notification.status", order.order);
  }

  if (order.orderBy === "reference_id") {
    qb.orderBy("notification.reference_id", order.order);
  }

  return qb;
};

const applyNotificationFilters = (
  qb: SelectQueryBuilder<Notification>,
  filters: INotificationFilter = {},
) => {
  if (filters.userId) {
    qb.andWhere("notification.user.user_id = :userId", {
      userId: filters.userId,
    });
  }

  if (filters.type) {
    qb.andWhere("notification.type = :type", { type: filters.type });
  }

  if (filters.status) {
    qb.andWhere("notification.status = :status", { status: filters.status });
  }

  if (filters.referenceId) {
    qb.andWhere("notification.reference_id = :referenceId", {
      referenceId: filters.referenceId,
    });
  }

  if (filters.role) {
    qb.andWhere("notification.role = :role", { role: filters.role });
  }

  return qb;
};

const notificationRepository = dataSource.getRepository(Notification).extend({
  async findAllNotifications(
    filters?: INotificationFilter,
    order?: INotificationOrder,
    pagination?: PaginationOptions,
  ) {
    const qb = this.createQueryBuilder("notification")
      .leftJoinAndSelect("notification.user", "user")
      .select(["notification", "user.user_id", "user.username"]);

    applyNotificationFilters(qb, filters);
    applyNotificationOrdering(qb, order);
    applyPagination(qb, pagination);

    const [notifications, count] = await qb.getManyAndCount();

    let unreadCount = null;
    if (filters?.userId) {
      unreadCount = await this.createQueryBuilder("notification")
        .where("notification.user.user_id = :userId", {
          userId: filters.userId,
        })
        .andWhere("notification.status = :status", {
          status: NotificationStatus.UNREAD,
        })
        .getCount();
    }

    return { notifications, count, unread_count: unreadCount };
  },

  createNotification(
    userId: string,
    type: NotificationType,
    message: string,
    referenceId: string,
    role: NotificationRole,
  ): Promise<Notification> {
    const notification = this.create({
      user: { user_id: userId },
      type,
      message,
      reference_id: referenceId,
      status: NotificationStatus.UNREAD,
      role,
    });
    return this.save(notification);
  },

  async findNotification(filters: INotificationFilter): Promise<Notification> {
    const qb = this.createQueryBuilder("notification")
      .leftJoinAndSelect("notification.user", "user")
      .select(["notification", "user.user_id", "user.username"]);
    applyNotificationFilters(qb, filters);
    const notification = await qb.getOne();
    if (!notification) {
      throw new Error("Notification not found");
    }
    return notification;
  },

  async findNotificationById(notificationId: string): Promise<Notification> {
    const notification = await this.findOne({
      where: { notification_id: notificationId },
    });
    if (!notification) {
      throw new Error(`Notification with id ${notificationId} not found`);
    }
    return notification;
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
          this.createNotification(
            user.user_id,
            type,
            message,
            referenceId,
            NotificationRole.USER,
          ),
        );
        return Promise.all(notifications);
      });
  },
});

export default notificationRepository;
