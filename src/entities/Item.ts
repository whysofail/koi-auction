import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IsNumber, IsString } from "class-validator";
import User from "./User";

@Entity()
class Item {
  @PrimaryGeneratedColumn("uuid")
  declare item_id: string;

  // Many-to-1 relationship with User (admin) (as a child)
  @IsString()
  @ManyToOne(() => User, (user) => user.items)
  @JoinColumn({ name: "seller_id" })
  declare user: User | null;

  @IsString()
  @Column()
  declare item_name: string;

  @IsString()
  @Column()
  declare item_description: string;

  // TODO - If possible, use enum for category
  @IsString()
  @Column()
  declare category: string;

  @IsNumber()
  @Column("decimal")
  declare starting_price: number;

  @IsNumber()
  @Column("decimal")
  declare reserve_price: number;

  // TODO - If possible, use enum for condition
  @IsString()
  @Column({
    default: "new",
  })
  declare condition: string;
}

export default Item;
