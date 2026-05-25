import { Body, Controller, Post } from "@nestjs/common";
import { RewardService } from "./reward.service";
import { CreateRewardDto } from "./dto/create-reward.dto";

@Controller("reward")
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @Post()
  async createReward(@Body() data: CreateRewardDto) {
    const res = this.rewardService.create(data);
    return res;
  }
}
