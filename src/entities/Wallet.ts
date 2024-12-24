import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { IsNumber, IsUUID } from "class-validator";
import User from "./User";
import Transaction from "./Transaction";

@Entity()
class Wallet {
  @PrimaryGeneratedColumn("uuid")
  declare wallet_id: string; // Primary key

  @IsUUID()
  @Column({ type: "uuid" })
  declare user_id: string; // Foreign key referencing User

  @IsNumber()
  @Column({ type: "decimal", precision: 12, scale: 2, default: 0.0 })
  declare balance: number; // Wallet balance, default to 0.00

  @CreateDateColumn()
  declare created_at: Date; // Timestamp for when the wallet was created

  @UpdateDateColumn()
  declare updated_at: Date; // Timestamp for the last wallet update

  @OneToOne(() => User, (user) => user.wallet, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  declare user: User; // Relationship with User entity

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  declare transactions: Transaction[] | null;
}

export default Wallet;
