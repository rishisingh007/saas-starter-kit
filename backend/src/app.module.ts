import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";

@Module({
  imports: [
    // Load env variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TypeORM MySQL connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        username: configService.get<string>("DB_USER"),
        password: configService.get<string>("DB_PASS"),
        database: configService.get<string>("DB_NAME"),
        autoLoadEntities: true, // Automatically load @Entity classes
        synchronize: true, // ⚠ Auto-create tables in dev
      }),
    }),

    // Your modules
    UsersModule,
    AuthModule,
    TenantsModule,
  ],
})
export class AppModule {}
