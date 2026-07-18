import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateOrderDto,
  GroupedBetItemDto,
  MessageValueItemDto,
} from "./dto/create-order.dto";
import { PrismaService } from "../prisma/prisma.service";
import { BetPairDto } from "../customer/dto/create-customer.dto";
import { Region } from "@prisma/client";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(data: CreateOrderDto) {
    try {
      const { customerId, results, type } = data;

      if (type !== "XAC")
        throw new ForbiddenException(
          "Bạn không có quyền thực hiện yêu cầu này!",
        );

      const isExistingCustomer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, settings: true },
      });

      if (!isExistingCustomer)
        throw new NotFoundException("Không tìm thấy khách hàng!");

      const customerSettings =
        (isExistingCustomer.settings as unknown as BetPairDto[]) || [];

      const calculatedResults = results.map(
        (group: GroupedBetItemDto): GroupedBetItemDto => {
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
              const regionKey: Region =
                stationCode === "MB"
                  ? "MB"
                  : stationCode === "MN"
                    ? "MN"
                    : stationCode === "MT"
                      ? "MT"
                      : "MN";

              let multiplier = 1;

              if (regionKey === "MB") {
                if (betType === "b2") multiplier = 27;
                else if (betType === "b3") multiplier = 23;
                else if (betType === "b4") multiplier = 20;
                else if (betType === "dd2" || betType === "dd3") multiplier = 1;
              } else {
                // Hệ số nhân cho các miền còn lại (MN, MT)
                if (betType === "b2") multiplier = 18;
                else if (betType === "b3") multiplier = 17;
                else if (betType === "b4") multiplier = 16;
                else if (betType === "dd2" || betType === "dd3") multiplier = 1;
              }

              const coValue = setting ? setting.c[regionKey] : 0;
              const settingType = setting ? setting.type : "tile";

              const items = stations[stationCode];
              if (!items) continue;

              finalGroup[betType][stationCode] = items.map(
                (item: unknown): MessageValueItemDto => {
                  const betItem = item as MessageValueItemDto;
                  const xac = betItem.score.xac;
                  let coCalculated = 0;

                  if (settingType === "tile") {
                    coCalculated = xac * coValue * multiplier;
                  } else if (settingType === "thanhtien")
                    coCalculated = xac * coValue;

                  return {
                    number: betItem.number,
                    score: {
                      xac: betItem.score.xac,
                      trung: betItem.score.trung,
                      co: coCalculated,
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
        message: "Tạo tin thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async editOrder(id: string, data: UpdateOrderDto) {
    try {
      // 1. Kiểm tra đơn hàng hiện tại có tồn tại không
      const existingOrder = await this.prisma.order.findUnique({
        where: { id },
        select: { customerId: true },
      });

      if (!existingOrder || !existingOrder.customerId) {
        throw new NotFoundException("Không tìm thấy tin nhắn cần sửa!");
      }

      // Tách riêng các trường ra khỏi data để tránh lỗi spread hoặc ghi đè nhầm kết quả cược
      const { results, customerId, ...remainingData } = data;

      let calculatedResults: GroupedBetItemDto[] | undefined = undefined;

      // TỐI ƯU: Chỉ khi có truyền "results" mới chạy logic query Customer và tính toán
      if (results && Array.isArray(results)) {
        const targetCustomerId = customerId || existingOrder.customerId;

        const customer = await this.prisma.customer.findUnique({
          where: { id: targetCustomerId },
          select: { settings: true },
        });

        if (!customer) {
          throw new NotFoundException(
            "Không tìm thấy khách hàng liên kết với tin này!",
          );
        }

        const customerSettings =
          (customer.settings as unknown as BetPairDto[]) || [];

        calculatedResults = results.map(
          (group: GroupedBetItemDto): GroupedBetItemDto => {
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
                // Xác định miền (Region)
                const regionKey: Region =
                  stationCode === "MB"
                    ? "MB"
                    : stationCode === "MN"
                      ? "MN"
                      : stationCode === "MT"
                        ? "MT"
                        : "MN";

                let multiplier = 1;

                if (regionKey === "MB") {
                  if (betType === "b2") multiplier = 27;
                  else if (betType === "b3") multiplier = 23;
                  else if (betType === "b4") multiplier = 20;
                  else if (betType === "dd2" || betType === "dd3")
                    multiplier = 1;
                } else {
                  // Hệ số nhân cho các miền còn lại (MN, MT)
                  if (betType === "b2") multiplier = 18;
                  else if (betType === "b3") multiplier = 17;
                  else if (betType === "b4") multiplier = 16;
                  else if (betType === "dd2" || betType === "dd3")
                    multiplier = 1;
                }

                const coValue = setting ? setting.c[regionKey] : 0;
                const settingType = setting ? setting.type : "tile";

                const items = stations[stationCode];
                if (!items) continue;

                finalGroup[betType][stationCode] = items.map(
                  (item: unknown): MessageValueItemDto => {
                    const betItem = item as MessageValueItemDto;
                    const xac = betItem.score.xac;
                    let coCalculated = 0;

                    if (settingType === "tile") {
                      coCalculated = xac * coValue * multiplier;
                    } else if (settingType === "thanhtien") {
                      coCalculated = xac * coValue;
                    }

                    return {
                      number: betItem.number,
                      score: {
                        xac: betItem.score.xac,
                        trung: betItem.score.trung,
                        co: coCalculated,
                      },
                    };
                  },
                );
              }
            }
            return finalGroup;
          },
        );
      }

      // 4. Cập nhật dữ liệu vào Database sử dụng Prisma
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: {
          ...(remainingData as Record<string, any>), // Các trường còn lại như type, release...
          customerId, // Sẽ tự ignore nếu undefined
          ...(calculatedResults && {
            results: JSON.parse(JSON.stringify(calculatedResults)),
          }),
        },
      });

      return {
        message: "Cập nhật tin nhắn thành công",
        order: updatedOrder,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
  async getAllOrderByDate(release: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { release },
      });

      return {
        message: "Lấy danh sách tin thành công",
        orders,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async getById(id: string) {
    try {
      const order = await this.prisma.order.findUnique({ where: { id } });

      if (!order) throw new NotFoundException("Không tìm thấy tin nhắn!");

      return {
        message: "Lấy tin nhắn thành công",
        order,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async deleteById(id: string) {
    try {
      const orderDeleted = await this.prisma.order.delete({
        where: { id },
      });

      if (!orderDeleted)
        throw new NotFoundException("Tin nhắn không tồn tại để xóa!");
      return {
        message: "Xóa đơn hàng thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
