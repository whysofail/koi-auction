import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";

@Entity()
class Item {
  @PrimaryGeneratedColumn("uuid")
  declare item_id: string;

  // Many-to-1 relationship with User (admin) (as a child)
  @ManyToOne(() => User, (user) => user.items)
  @JoinColumn({ name: "seller_id" })
  declare user: User | null;

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
  @Column({
    default: "new",
  })
  declare condition: string;
}

export default Item;
