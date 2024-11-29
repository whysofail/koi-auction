import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn("uuid")
  declare id: number;

  @Column()
  declare name: string;

  @Column()
  declare email: string;

  @Column()
  declare password: string;
}

export default User;
