import { IsEmail, MinLength } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import Auction from "./Auction";
import Bid from "./Bid";

@Entity()
class User {
  @PrimaryGeneratedColumn("uuid")
  declare user_id: number;

  @Column()
  declare username: string;

  @IsEmail()
  @Column()
  declare email: string;

  @MinLength(8)
  @Column()
  declare password: string;

  @CreateDateColumn()
  declare registration_date: Date;

  @UpdateDateColumn()
  declare last_update: Date;

  // One-to-many relationship with Auction (as a parent)
  @OneToMany(() => Auction, (auction) => auction.user)
  declare auctions: Auction[];

  // One-to-many relationship with Bid (as a parent)
  @OneToMany(() => Bid, (bid) => bid.user)
  declare bids: Bid[];
}

export default User;
