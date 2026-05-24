import { Module } from "@nestjs/common";
import { RewardModule } from "./reward/reward.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { CustomerModule } from "./customer/customer.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [PrismaModule, RewardModule, UserModule, CustomerModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
