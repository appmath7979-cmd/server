import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
// Import trực tiếp các DTO và Class từ file DTO của bạn
import {
  CreateOrderDto,
  GroupedBetItemDto,
  MessageValueItemDto,
} from "./dto/create-order.dto";
import { PrismaService } from "../prisma/prisma.service";
import { BetPairDto } from "src/customer/dto/create-customer.dto";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) { }

  async createOrder(data: CreateOrderDto) {
    try {
      const { customerId, timeRelease, dateRelease, results } = data;

      const isExistingCustomer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, settings: true },
      });

      if (!isExistingCustomer)
        throw new NotFoundException("Không tìm thấy khách hàng!");

      const isExistingOrder = await this.prisma.order.findFirst({
        where: {
          AND: [{ timeRelease }, { dateRelease }],
        },
        select: { id: true },
      });

      if (isExistingOrder)
        throw new ConflictException("Tin đã tồn tại hoặc không hợp lệ!");

      // 3. Ép kiểu cấu hình khách hàng
      const customerSettings =
        (isExistingCustomer.settings as unknown as BetPairDto[]) || [];

      // 4. Duyệt qua mảng results dựa trên cấu trúc DTO chính xác
      const calculatedResults = results.map(
        (group: GroupedBetItemDto): GroupedBetItemDto => {
          // Sao chép object nhưng ép kiểu Record sâu để xử lý an toàn
          const updatedGroup = { ...group } as Record<
            string,
            Record<string, unknown[]>
          >;
          const finalGroup: Record<
            string,
            Record<string, MessageValueItemDto[]>
          > = {};

          for (const betType in updatedGroup) {
            const setting = customerSettings.find((s) => s.name === betType);
            const stations = updatedGroup[betType];

            if (!stations) continue;
            finalGroup[betType] = {};

            for (const stationCode in stations) {
              // Xác định miền dựa vào đài
              const regionKey: "MB" | "MT" | "MN" =
                stationCode === "MB" ? "MB" : "MN";

              const coValue = setting ? setting.c[regionKey] : 0;
              const settingType = setting ? setting.type : "tile";

              const items = stations[stationCode];
              if (!items) continue;

              // Ép kiểu tường minh cho mảng trả về từ hàm .map() khớp MessageValueItemDto[]
              finalGroup[betType][stationCode] = items.map(
                (item: unknown): MessageValueItemDto => {
                  // Ép kiểu item từ unknown sang cấu trúc MessageValueItemDto chính xác
                  const betItem = item as MessageValueItemDto;
                  const xac = betItem.score.xac;
                  let coCalculated = 0;

                  if (settingType === "tile") {
                    const rate = coValue > 1 ? coValue / 100 : coValue;
                    coCalculated = xac * rate;
                  } else if (settingType === "thanhtien") {
                    coCalculated = coValue;
                  }

                  // Trả về object đúng chuẩn cấu trúc của MessageValueItemDto
                  return {
                    number: betItem.number,
                    score: {
                      xac: betItem.score.xac,
                      trung: betItem.score.trung,
                      co: coCalculated, // Đã cập nhật tiền cò
                    },
                  };
                },
              );
            }
          }
          return finalGroup;
        },
      );

      await this.prisma.order.create({
        data: {
          ...data,
          results: JSON.parse(JSON.stringify(calculatedResults)),
        },
      });

      return {
        message: "Tạo đơn thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async getAllOrderByDate(dateRelease: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { dateRelease },
      });

      return {
        message: "Lấy danh sách đơn thành công",
        orders,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
