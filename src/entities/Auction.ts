import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MinLength,
  IsPositive,
  Min,
} from "class-validator";

import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";
import Bid from "./Bid";
import AuctionParticipant from "./AuctionParticipant";

export enum AuctionStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  FAILED = "FAILED",
  STARTED = "STARTED",
  DELETED = "DELETED",
}

@Entity()
class Auction {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID()
  declare auction_id: string;

  @Column({
    type: "varchar",
    default: "Auction Title",
    nullable: false,
  })
  @IsString()
  @MinLength(1, { message: "Title must not be empty" })
  declare title: string;

  @Column({
    type: "text",
    nullable: false,
  })
  @IsString()
  @MinLength(1, { message: "Description must not be empty" })
  declare description: string;

  @Column({
    type: "varchar",
    nullable: false,
    unique: true,
  })
  @IsString()
  @MinLength(1, { message: "Item must not be empty" })
  declare item: string;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  declare start_datetime: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  declare end_datetime: Date;

  @Column({
    type: "enum",
    enum: AuctionStatus,
    default: AuctionStatus.DRAFT,
  })
  @IsEnum(AuctionStatus)
  declare status: AuctionStatus;

  @Column({
    type: "decimal",
    precision: 10, // Total digits
    scale: 2, // Digits after the decimal point
    default: 0,
  })
  declare current_highest_bid: number | null | undefined;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsPositive()
  @Min(0, { message: "Reserve price must be a positive number" })
  declare reserve_price: number | null | undefined;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 50000,
  })
  @IsPositive()
  declare bid_increment: number | null | undefined;

  @ManyToOne(() => User, (user) => user.auctions)
  @JoinColumn({ name: "created_by_id" })
  declare user: User;

  @CreateDateColumn({ name: "created_at" })
  declare created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  declare updated_at: Date;

  @OneToMany(() => Bid, (bid) => bid.auction)
  declare bids?: Bid[];

  @OneToMany(
    () => AuctionParticipant,
    (auctionParticipant) => auctionParticipant.auction,
  )
  declare participants: AuctionParticipant[];
}

export default Auction;
