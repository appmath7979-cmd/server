import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateRewardDto } from "./dto/create-reward.dto";
import { GetRewardDto } from "./dto/get-reward.dto";
import { rewardMessages } from "src/constants/messages.constant";

const { get, getServerError, createServerError, notFound } = rewardMessages;

@Injectable()
export class RewardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRewardDto) {
    try {
      const { release, rewards } = data;
      const results = await this.prisma.reward.create({
        data: {
          release,
          rewards: {
            create: rewards.map((item) => {
              return {
                region: item.region,
                results: item.results,
                station: item.station,
              };
            }),
          },
        },
      });
      return {
        message: get,
        results,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(createServerError);
    }
  }

  async get(query: GetRewardDto) {
    try {
      const results = await this.prisma.reward.findFirst({
        where: { release: query.release },
        include: {
          rewards: true,
        },
      });

      if (!results) {
        const [year, month, day] = query.release.split("-");
        const time = `${day}/${month}/${year}`;
        throw new NotFoundException(`${notFound} ngày ${time}!`);
      }

      return {
        message: "Lấy kết quả thành công.",
        results,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(getServerError);
    }
  }

  async getById(id: string) {
    try {
      const results = await this.prisma.reward.findUnique({
        where: { id },
        include: {
          rewards: true,
        },
      });

      if (!results) throw new NotFoundException(`${notFound}!`);

      return {
        message: get,
        results,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(getServerError);
    }
  }
}
