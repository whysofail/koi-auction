import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Column,
} from "typeorm";
import User from "./User";
import Auction from "./Auction";

@Entity("wishlists")
@Unique(["user_id", "auction_id"]) // Prevent duplicate wishlists
export class Wishlist {
  @PrimaryGeneratedColumn("uuid")
  declare wishlist_id: string;

  @CreateDateColumn()
  declare created_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  declare user: User;

  @ManyToOne(() => Auction)
  @JoinColumn({ name: "auction_id" })
  declare auction: Auction;

  @Column()
  declare user_id: string;

  @Column()
  declare auction_id: string;
}

export default Wishlist;
