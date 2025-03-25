import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { IsUUID, IsOptional, IsEnum } from "class-validator";
import User from "./User";
import Auction from "./Auction";

export enum AuctionBuyNowStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

@Entity()
class AuctionBuyNow {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  declare auction_buynow_id: string;

  @ManyToOne(() => Auction)
  @JoinColumn({ name: "auction_id" })
  declare auction: Auction;

  @Column({ name: "auction_id" })
  @IsUUID()
  declare auction_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "buyer_id" })
  declare buyer: User;

  @Column({ name: "buyer_id" })
  @IsUUID()
  declare buyer_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "admin_id" })
  declare admin?: User;

  @Column({
    name: "admin_id",
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  declare admin_id?: string;

  @Column({
    type: "enum",
    enum: AuctionBuyNowStatus,
    default: AuctionBuyNowStatus.PENDING,
  })
  @IsEnum(AuctionBuyNowStatus)
  declare status: AuctionBuyNowStatus;

  @Column({
    type: "text",
    nullable: true,
  })
  @IsOptional()
  declare transaction_reference?: string;

  @Column({
    type: "text",
    nullable: true,
  })
  @IsOptional()
  declare admin_notes?: string;

  @CreateDateColumn({ name: "created_at" })
  declare created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  declare updated_at: Date;
}

export default AuctionBuyNow;
