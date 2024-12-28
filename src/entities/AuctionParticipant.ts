import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import Auction from "./Auction";
import User from "./User";

@Entity()
class AuctionParticipant {
  @PrimaryGeneratedColumn("uuid")
  declare auction_participant_id: string;

  @ManyToOne(() => Auction, (auction) => auction.participants)
  @JoinColumn({ name: "auction_id" })
  declare auction: Auction;

  @ManyToOne(() => User, (user) => user.auctionParticipants)
  @JoinColumn({ name: "user_id" })
  declare user: User;

  @CreateDateColumn({ name: "joined_at" })
  declare joined_at: Date;
}

export default AuctionParticipant;
