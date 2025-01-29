import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNumber, IsEnum, IsUUID } from "class-validator";
import Wallet from "./Wallet";
import User from "./User";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER = "TRANSFER",
  PARTICIPATE = "PARTICIPATE",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

@Entity()
class Transaction {
  @PrimaryGeneratedColumn("uuid")
  declare transaction_id: string; // Primary key

  // Relationship with Wallet (No need for wallet_id column here)
  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, {
    onDelete: "CASCADE", // Ensures that when a wallet is deleted, related transactions are also deleted
  })
  @JoinColumn({ name: "wallet_id" }) // This is the foreign key that TypeORM will use
  declare wallet: Wallet; // Relationship with Wallet entity

  @IsUUID()
  @Column({ type: "uuid", nullable: true })
  declare admin_id: string | null; // Optional foreign key for admin processing the transaction

  @IsNumber()
  @Column({ type: "decimal", precision: 12, scale: 2 })
  declare amount: number; // Transaction amount

  @IsEnum(TransactionType)
  @Column({
    type: "enum",
    enum: TransactionType,
  })
  declare type: TransactionType; // Type of transaction (e.g., deposit, withdrawal)

  @IsEnum(TransactionStatus)
  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  declare status: TransactionStatus; // Status of the transaction (default: pending)

  @Column({ type: "text", nullable: true })
  declare proof_of_payment: string | null; // Optional proof of payment (e.g., receipt, image URL)

  @CreateDateColumn()
  declare created_at: Date; // Timestamp for when the transaction was created

  // Relationship with Admin (nullable)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "admin_id" })
  declare admin: User | null; // Relationship with Admin (optional)
}

export default Transaction;
