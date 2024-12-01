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

@Entity()
class Auction {
  @PrimaryGeneratedColumn("uuid")
  declare auction_id: number;

  // 1-to-1 relationship with Item (as a child)
  @OneToOne(() => Item)
  @JoinColumn({ name: "item_id" })
  declare item: Item;

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
  @Column()
  declare status: string;

  @Column("decimal")
  declare current_highest_bid: number;

  // Many-to-one relationship with User that represents the highest bidder (as a child)
  @ManyToOne(() => User, (user) => user.auctions)
  @JoinColumn({ name: "highest_bidder_id" })
  declare user: User;

  // One-to-many relationship with Bid (as a parent)
  @OneToMany(() => Bid, (bid) => bid.auction)
  declare bids: Bid[];
}

export default Auction;
