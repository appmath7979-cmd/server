import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { CustomerModule } from "./customer/customer.module";
import { SettingModule } from "./setting/setting.module";
import { OrderModule } from "./order/order.module";
import { RewardModule } from "./reward/reward.module";
import { ReportModule } from "./report/report.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CustomerModule,
    SettingModule,
    OrderModule,
    RewardModule,
    ReportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
