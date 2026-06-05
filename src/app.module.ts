import { Module } from "@nestjs/common";
import { RewardModule } from "./reward/reward.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { CustomerModule } from "./customer/customer.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RewardModule,
    UserModule,
    AuthModule,
    CustomerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
