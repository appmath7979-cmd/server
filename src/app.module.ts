import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { CustomerModule } from "./customer/customer.module";
import { OrderModule } from "./order/order.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CustomerModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
