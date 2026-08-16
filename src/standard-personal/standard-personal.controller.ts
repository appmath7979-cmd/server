import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { StandardPersonalService } from "./standard-personal.service";
import { CreateStandardPersonalDto } from "./dto/create-standard-personal.dto";

@Controller("standard-personal")
export class StandardPersonalController {
  constructor(
    private readonly standardPersonalService: StandardPersonalService,
  ) {}

  @Get("/customer/:customerId")
  async getMany(
    @Param("customerId") customerId: string,
    @Query("day") day: number,
  ) {
    return await this.standardPersonalService.getStandard({ customerId, day });
  }

  @Post()
  async create(@Body() data: CreateStandardPersonalDto[]) {
    await this.standardPersonalService.createStandard(data);
  }
}
