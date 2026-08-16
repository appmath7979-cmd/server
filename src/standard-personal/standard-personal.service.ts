import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStandardPersonalDto } from "./dto/create-standard-personal.dto";

@Injectable()
export class StandardPersonalService {
  constructor(private readonly prisma: PrismaService) {}

  async getStandard({ customerId, day }: { customerId: string; day: number }) {
    try {
      const standards = await this.prisma.personalStandard.findMany({
        where: { customerId, day },
      });

      return {
        message: "Tìm kiếm dư chuẩn thành công!",
        standards,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async createStandard(data: CreateStandardPersonalDto[]) {
    try {
      if (!data || data.length < 1)
        throw new BadRequestException("Dữ liệu không hợp lệ!");

      await this.prisma.personalStandard.createMany({ data });
      return {
        message: "Tạo chuẩn thành công!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
