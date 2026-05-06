import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { CustomerModule } from "./customer/customer.module";

@Module({
  imports: [UserModule, AuthModule, CustomerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
