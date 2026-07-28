import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { RewardService } from "./reward.service";
import { CreateRewardDto } from "./dto/create-reward.dto";

@Controller("reward")
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  async createReward(@Body() data: CreateRewardDto[]) {
    return await this.rewardService.create(data);
  }

  @Get()
  async getReward(@Query("release") release: string) {
    return await this.rewardService.findByDate(release);
  }
}
