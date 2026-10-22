import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { YmqRoleBrokerModule } from "./ymq-role-broker/ymq-role-broker.module";

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, YmqRoleBrokerModule],
})
export class AppModule {}
