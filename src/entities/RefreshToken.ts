import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import User from "./User";

@Entity()
export default class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  declare token_id: string;

  @Column()
  declare token: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  declare user: User;

  @CreateDateColumn()
  declare created_at: Date;

  @Column()
  declare expires_at: Date;

  @Column({ default: false })
  declare is_revoked: boolean;
}
