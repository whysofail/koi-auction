import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import User from "./User";
import Auction from "./Auction";

@Entity("wishlists")
@Unique(["user", "auction"]) // Prevent duplicate wishlists
class Wishlist {
  @PrimaryGeneratedColumn("uuid")
  declare wishlist_id: string;

  @CreateDateColumn()
  declare created_at: Date;

  @ManyToOne(() => User, (user) => user.wishlists, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  declare user: User;

  @ManyToOne(() => Auction, (auction) => auction.wishlists, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "auction_id" })
  declare auction: Auction;
}

export default Wishlist;
