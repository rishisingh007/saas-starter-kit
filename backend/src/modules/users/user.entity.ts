import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Tenant } from "../tenants/tenant.entity";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  TENANT_ADMIN = "TENANT_ADMIN",
  USER = "USER",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  tenant: Tenant;
}
