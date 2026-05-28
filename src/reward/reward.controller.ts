import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { RewardService } from "./reward.service";
import { CreateRewardDto } from "./dto/create-reward.dto";
import { GetRewardByTime } from "./dto/get-reward.dto";

@Controller("reward")
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  async createReward(@Body() data: CreateRewardDto) {
    console.log(data);
    const res = this.rewardService.create(data);
    return res;
  }

  @Get()
  async getRewardByTime(@Query() query: GetRewardByTime) {
    const res = await this.rewardService.getByTime(query);
    return res;
  }
}
