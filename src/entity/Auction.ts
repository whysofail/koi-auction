import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import User from "./User";
import Item from "./Item";
import Bid from "./Bid";

export enum AuctionStatus {
  DRAFT = "DRAFT", // Auction is being prepared but not yet active
  PENDING = "PENDING", // Auction is scheduled but not started
  ACTIVE = "ACTIVE", // Auction is currently ongoing and accepting bids
  COMPLETED = "COMPLETED", // Auction has ended naturally with a winner
  CANCELLED = "CANCELLED", // Auction was terminated before completion
  EXPIRED = "EXPIRED", // Auction ended without meeting reserve price or other conditions
  FAILED = "FAILED", // Auction did not receive any bids or meet minimum requirements
}

@Entity()
class Auction {
  @PrimaryGeneratedColumn("uuid")
  declare auction_id: number;

  @CreateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP(6)",
    precision: 6,
  })
  declare start_time: Date;

  @CreateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP(6)",
    precision: 6,
  })
  declare end_time: Date;

  // TODO - If possible, use enum for status
  @Column({
    type: "enum",
    enum: AuctionStatus,
    default: AuctionStatus.PENDING,
  })
  declare status: AuctionStatus;

  @Column({
    type: "decimal",
    default: 0,
  })
  declare current_highest_bid: number;

  // 1-to-1 relationship with Item (as a child)
  @OneToOne(() => Item)
  @JoinColumn({ name: "item_id" })
  declare item: Item;

  // Many-to-one relationship that represents the creator of the auction (admin) as a child
  @ManyToOne(() => User, (user) => user.auctions)
  @JoinColumn({ name: "created_by_id" })
  declare user: User;

  // One-to-many relationship with Bid (as a parent)
  @OneToMany(() => Bid, (bid) => bid.auction)
  declare bids: Bid[] | null;
}

export default Auction;
