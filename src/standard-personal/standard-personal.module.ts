import { Module } from "@nestjs/common";
import { StandardPersonalService } from "./standard-personal.service";
import { StandardPersonalController } from "./standard-personal.controller";

@Module({
  controllers: [StandardPersonalController],
  providers: [StandardPersonalService],
})
export class StandardPersonalModule {}
