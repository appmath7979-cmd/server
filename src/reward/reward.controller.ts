import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { RewardService } from "./reward.service";
import { CreateRewardDto } from "./dto/create-reward.dto";
import { GetRewardDto } from "./dto/get-reward.dto";

@Controller("reward")
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @HttpCode(201)
  @Post()
  async createReward(@Body() data: CreateRewardDto) {
    const res = await this.rewardService.create(data);
    return res;
  }

  @HttpCode(200)
  @Get()
  async getReward(@Query() query: GetRewardDto) {
    const res = await this.rewardService.get(query);
    return res;
  }

  @HttpCode(200)
  @Get(":id")
  async getRewardById(@Param("id") id: string) {
    const res = await this.rewardService.getById(id);
    return res;
  }
}
