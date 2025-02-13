/* eslint-disable import/no-cycle */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsNumber } from "class-validator";
import User from "./User";
import Auction from "./Auction";

@Entity()
class Bid {
  @PrimaryGeneratedColumn("uuid")
  declare bid_id: string;

  @IsNumber()
  @Column("decimal")
  declare bid_amount: number;

  @CreateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP(6)",
    precision: 6,
  })
  declare bid_time: Date;

  @ManyToOne(() => User, (user) => user.bids)
  @JoinColumn({ name: "user_id" })
  declare user: User;

  @ManyToOne(() => Auction, (auction) => auction.bids)
  @JoinColumn({ name: "auction_id" })
  declare auction: Auction;
}

export default Bid;
