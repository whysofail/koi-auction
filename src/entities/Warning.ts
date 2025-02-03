import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import User from "./User";

export enum WarningStatus {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
}
@Entity()
class Warning {
  @PrimaryGeneratedColumn("uuid")
  declare warning_id: string;

  @ManyToOne(() => User, (user) => user.warnings, { onDelete: "CASCADE" })
  declare user: User;

  @Column()
  declare reason: string;

  @Column({
    type: "enum",
    enum: WarningStatus,
    default: WarningStatus.ACTIVE,
  })
  declare status: WarningStatus;

  @ManyToOne(() => User, (user) => user.warnings, { onDelete: "CASCADE" })
  declare admin: User;

  @CreateDateColumn()
  declare created_at: Date;
}

export default Warning;
