import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";
import Item from "./Item";
import Bid from "./Bid";

export enum AuctionStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  FAILED = "FAILED",
}

@Entity()
class Auction {
  @PrimaryGeneratedColumn("uuid")
  declare auction_id: string;

  @OneToOne(() => Item)
  @JoinColumn({ name: "item_id" })
  declare item: Item;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  declare start_datetime: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  declare end_datetime: Date;

  @Column({
    type: "enum",
    enum: AuctionStatus,
    default: AuctionStatus.PENDING,
  })
  declare status: AuctionStatus;

  @Column({
    type: "decimal",
    precision: 10, // Total digits
    scale: 2, // Digits after the decimal point
    default: 0,
  })
  declare current_highest_bid: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    default: null,
  })
  declare reserve_price: number | null;

  @ManyToOne(() => User, (user) => user.auctions)
  @JoinColumn({ name: "created_by_id" })
  declare user: User;

  @CreateDateColumn({ name: "created_at" })
  declare created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  declare updated_at: Date;

  @OneToMany(() => Bid, (bid) => bid.auction)
  declare bids?: Bid[]; // Marked optional
}

export default Auction;
