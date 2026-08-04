import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReportDetailDto } from "./dto/create-report.dto";
import { Region } from "@prisma/client";
@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    release,
    startDate,
    endDate,
  }: {
    release?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          OR: [
            { release },
            {
              createdAt: {
                gte: startDate && new Date(startDate),
                lte: endDate && new Date(endDate),
              },
            },
          ],
        },
        include: {
          details: true,
          customer: { select: { fullName: true, type: true, id: true } },
        },
      });

      if (!orders)
        return {
          message: "Tìm kiếm báo cáo thành công",
          report: [],
        };

      const details: CreateReportDetailDto[] = orders.flatMap((order) => {
        const {
          region,
          release: orderRelease,
          details: orderDetails,
          customer,
        } = order;

        return orderDetails.map((item) => ({
          number: item.number,
          value:
            item.co - item.trung * (customer?.type === "OWNER" ? -1 : 1) || 1,
          syntax: item.syntax,
          type: item.type,
          region,
          release: orderRelease,
          fullName: customer?.fullName ?? "",
          customerId: customer?.id ?? "",
          customerType: customer?.type || "GUEST",
        }));
      });

      let totalMB = 0;
      let totalMT = 0;
      let totalMN = 0;

      for (const item of details) {
        if (item.region === Region.MB) {
          totalMB += item.value;
        } else if (item.region === Region.MT) {
          totalMT += item.value;
        } else if (item.region === Region.MN) {
          totalMN += item.value;
        }
      }

      return {
        message: "Tìm kiếm báo cáo thành công",
        reports: {
          release: release ?? "",
          details,
          total: totalMB + totalMT + totalMN,
          totalMB,
          totalMT,
          totalMN,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
