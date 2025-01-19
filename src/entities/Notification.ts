import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./User";

export enum NotificationType {
  BID = "BID",
  AUCTION = "AUCTION",
  SYSTEM = "SYSTEM",
  // Add other notification types as needed
}

export enum NotificationStatus {
  PENDING = "PENDING",
  READ = "READ",
  ARCHIVED = "ARCHIVED",
}

@Entity()
class Notification {
  @PrimaryGeneratedColumn("uuid")
  declare notification_id: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: "user_id" })
  declare user: User;

  @Column({ type: "enum", enum: NotificationType })
  declare type: NotificationType;

  @Column({ type: "text", nullable: true, default: null })
  declare message: string;

  @Column({ type: "varchar", nullable: true })
  declare reference_id: string; // You can store an auction ID, bid ID, etc.

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  declare status: NotificationStatus;

  @CreateDateColumn()
  declare created_at: Date;

  @Column({ nullable: true })
  declare updated_at: Date; // optional, in case the notification gets updated
}

export default Notification;
