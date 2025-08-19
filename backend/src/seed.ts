import { DataSource } from "typeorm";
import { User, UserRole } from "./modules/users/user.entity";
import { Tenant } from "./modules/tenants/tenant.entity";
import * as bcrypt from "bcrypt";

const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "password",
  database: "saas_app",
  entities: [User, Tenant],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();

  const tenant1 = AppDataSource.manager.create(Tenant, { name: "Acme Corp" });
  const tenant2 = AppDataSource.manager.create(Tenant, { name: "Globex Inc" });
  await AppDataSource.manager.save([tenant1, tenant2]);

  const superAdmin = AppDataSource.manager.create(User, {
    name: "Super Admin",
    email: "superadmin@example.com",
    passwordHash: await bcrypt.hash("password", 10),
    role: UserRole.SUPER_ADMIN,
  });

  const tenant1Admin = AppDataSource.manager.create(User, {
    name: "Tenant 1 Admin",
    email: "admin@acme.com",
    passwordHash: await bcrypt.hash("password", 10),
    role: UserRole.TENANT_ADMIN,
    tenant: tenant1,
  });

  const tenant2Admin = AppDataSource.manager.create(User, {
    name: "Tenant 2 Admin",
    email: "admin@globex.com",
    passwordHash: await bcrypt.hash("password", 10),
    role: UserRole.TENANT_ADMIN,
    tenant: tenant2,
  });

  await AppDataSource.manager.save([superAdmin, tenant1Admin, tenant2Admin]);

  console.log("✅ Seed data created");
  process.exit();
}

seed();
