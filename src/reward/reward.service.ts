import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRewardDto } from "./dto/create-reward.dto";
import { GetRewardByTime } from "./dto/get-reward.dto";

@Injectable()
export class RewardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRewardDto) {
    try {
      const { release, rewards } = data;
      const isExisting = await this.prisma.reward.findFirst({
        where: { release },
        select: {
          id: true,
          rewards: {
            select: { id: true, station: true, results: true },
          },
        },
      });

      if (!isExisting) {
        const createdData = await this.prisma.reward.create({
          data: {
            release,
            rewards: {
              create: rewards,
            },
          },
        });
        return { message: "Tạo kết quả thành công.", createdData };
      }

      const duplicateStations = isExisting.rewards.filter((item) => {
        return rewards.some((re) => re.station === item.station);
      });

      const duplicateIds = duplicateStations.map((item) => item.id);

      const updateCreatedData = await this.prisma.reward.update({
        where: { id: isExisting.id },
        data: {
          ...data,
          rewards: {
            deleteMany: {
              id: { in: duplicateIds },
            },
            create: rewards,
          },
        },
      });

      return { message: "Tạo kết quả thành công.", updateCreatedData };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Lỗi hệ thống. Vui lòng thử lại sau!",
      );
    }
  }

  async getByTime(release: GetRewardByTime) {
    try {
      const findReward = await this.prisma.reward.findFirst({
        where: release,
        include: { rewards: true },
      });
      if (!findReward) throw new NotFoundException("Không tìm thấy thông tin!");

      return {
        message: "Lấy thông tin giải thưởng thành công.",
        reward: findReward,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        "Lỗi hệ thống. Vui lòng thử lại sau!",
      );
    }
  }
}
