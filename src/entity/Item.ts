import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";

@Entity()
class Item {
  @PrimaryGeneratedColumn("uuid")
  declare item_id: number;

  // 1-to-1 relationship with User (as a child)
  @OneToOne(() => User)
  @JoinColumn({ name: "seller_id" })
  declare user: User;

  @Column()
  declare item_name: string;

  @Column()
  declare item_description: string;

  // TODO - If possible, use enum for category
  @Column()
  declare category: string;

  @Column("decimal")
  declare starting_price: number;

  @Column("decimal")
  declare reserve_price: number;

  // TODO - If possible, use enum for condition
  @Column()
  declare condition: string;
}

export default Item;
