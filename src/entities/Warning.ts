import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import User from "./User";

@Entity()
export class Warning {
  @PrimaryGeneratedColumn("uuid")
  declare warning_id: string;

  @ManyToOne(() => User, (user) => user.warnings, { onDelete: "CASCADE" })
  declare user: User;

  @Column()
  declare reason: string;

  @CreateDateColumn()
  declare created_at: Date;
}
