import { Module } from "@nestjs/common";
import { RewardModule } from "./reward/reward.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, RewardModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
