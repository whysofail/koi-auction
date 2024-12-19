import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
  UpdateDateColumn,
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
  declare auction_id: string;

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

  @UpdateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP(6)",
    precision: 6,
  })
  declare updated_at: Date; // Updated timestamp to track changes to the auction status

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

  @Column({
    type: "decimal",
    nullable: true,
    default: null,
  })
  declare reserve_price: number | null; // Optional field for a reserve price

  @OneToOne(() => Item)
  @JoinColumn({ name: "item_id" })
  declare item: Item;

  @ManyToOne(() => User, (user) => user.auctions)
  @JoinColumn({ name: "created_by_id" })
  declare user: User;

  @OneToMany(() => Bid, (bid) => bid.auction)
  declare bids: Bid[] | null;
}

export default Auction;
