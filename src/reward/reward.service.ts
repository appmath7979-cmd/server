import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRewardDto } from "./dto/create-reward.dto";

@Injectable()
export class RewardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRewardDto) {
    try {
      const { release, rewards } = data;
      const id = await this.prisma.reward.create({
        data: {
          release,
          rewards: {
            create: rewards,
          },
        },
        select: { id: true },
      });
      return { message: "Tạo kết quả thành công.", id };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Lỗi hệ thống. Vui lòng thử lại sau!",
      );
    }
  }
}
