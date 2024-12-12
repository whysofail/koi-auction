/* eslint-disable import/no-cycle */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import User from "./User";
import Auction from "./Auction";

@Entity()
class Bid {
  @PrimaryGeneratedColumn("uuid")
  declare bid_id: number;

  @Column("decimal")
  declare bid_amount: number;

  @CreateDateColumn({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP(6)",
    precision: 6,
  })
  declare bid_time: Date;

  // Many-to-one relationship with User (buyer) (as a child)
  @ManyToOne(() => User, (user) => user.bids)
  @JoinColumn({ name: "user_id" })
  declare user: User | null;

  // Many-to-one relationship with Auction (as a child)
  @ManyToOne(() => Auction, (auction) => auction.bids)
  @JoinColumn({ name: "auction_id" })
  declare auction: Auction | null;
}

export default Bid;
