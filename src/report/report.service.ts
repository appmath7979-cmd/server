import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ release }: { release?: string }) {
    try {
      const reports = await this.prisma.report.findMany({
        where: { release },
        include: { details: true },
      });

      return {
        message: "Tìm kiếm báo cáo thành công",
        reports,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
