import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "../users/user.entity";

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];
}
