import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Region } from "@prisma/client";
import { BetPairDto } from "../customer/dto/create-customer.dto";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private getDbSettingName(type: string, syntax: string): string {
    const currentType = (type || "").toLowerCase().trim();
    const currentSyntax = (syntax || "").toLowerCase().trim();

    // 1. Nhóm Bao lô
    if (currentType === "bao" || currentType === "b") {
      if (currentSyntax === "2c" || currentSyntax === "2") return "b2";
      if (currentSyntax === "3c" || currentSyntax === "3") return "b3";
      if (currentSyntax === "4c" || currentSyntax === "4") return "b4";
    }

    // 2. Nhóm Đầu, Đuôi, Đầu Đuôi (2c -> dd2, 3c -> dd3)
    if (["dd", "dau", "duoi", "xdau", "xduoi", "xc"].includes(currentType)) {
      if (currentSyntax === "2c" || currentSyntax === "2") return "dd2";
      if (currentSyntax === "3c" || currentSyntax === "3") return "dd3";
    }

    // 3. Nhóm Đá
    if (currentType === "da") return "da";

    // 4. Nhóm Đá xiên
    if (["dax", "dx", "da_xien"].includes(currentType)) return "dax";

    return currentType;
  }

  async createOrder(payload: CreateOrderDto) {
    try {
      const {
        customerId,
        release,
        region,
        isLayoff,
        details,
        message: rawMessage,
      } = payload;

      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, settings: true },
      });

      if (!customer)
        throw new NotFoundException(
          "Không tìm thấy người dùng hoặc người dùng không hợp lệ để lưu tin nhắn!",
        );

      const { settings } = customer;
      const customerSettings = (settings as unknown as BetPairDto[]) || [];

      await this.prisma.$transaction(async (tx) => {
        // 1. Tạo đơn hàng (Order) gốc
        const order = await tx.order.create({
          data: {
            release,
            isLayoff,
            region,
            customerId,
            message: rawMessage,
          },
        });

        // 2. Tính toán và lưu danh sách dòng cược chi tiết
        const detailsData = details.map((item) => {
          const regionKey: Region =
            item.stationCode === "MB"
              ? "MB"
              : item.stationCode === "MN"
                ? "MN"
                : item.stationCode === "MT"
                  ? "MT"
                  : region;

          // Chuẩn hóa tên cấu hình theo DB (Ví dụ: 'dau' + '2c' -> 'dd2')
          const dbSettingName = this.getDbSettingName(
            item.type ?? "",
            item.syntax ?? "",
          );

          // Tìm cấu hình trong DB dựa theo tên đã chuẩn hóa
          const setting = customerSettings.find(
            (s) => s.name === dbSettingName,
          );

          // XÁC ĐỊNH HỆ SỐ LÔ (MULTIPLIER)
          let multiplier = 1;
          if (dbSettingName === "b2") {
            multiplier = regionKey === "MB" ? 27 : 18;
          } else if (dbSettingName === "b3") {
            multiplier = regionKey === "MB" ? 23 : 17;
          } else if (dbSettingName === "b4") {
            multiplier = regionKey === "MB" ? 20 : 16;
          }

          // Lấy giá trị c từ setting
          const coValue =
            setting && setting.c && setting.c[regionKey] !== undefined
              ? Number(setting.c[regionKey])
              : 0;

          const settingType = setting ? setting.type : "tile";

          // Tính đơn giá price snapshot và tiền cò
          const priceCalculated =
            settingType === "tile" ? coValue * multiplier : coValue;
          const coCalculated = item.xac * priceCalculated;

          return {
            orderId: order.id,
            customerId,
            date: release,
            syntax: item.syntax,
            stationCode: item.stationCode,
            number: item.number,
            type: item.type,
            xac: item.xac,
            price: priceCalculated,
            co: coCalculated,
          };
        });

        if (detailsData.length > 0) {
          await tx.orderDetails.createMany({
            data: detailsData,
          });
        }
      });

      return {
        message: "Tạo tin nhắn và tính toán xác cò thành công!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async createLayoff(payload: CreateOrderDto) {
    try {
      const { customerId, details, release, region, isLayoff, message } =
        payload;

      return await this.prisma.$transaction(async (tx) => {
        // 1. Tạo bản ghi Order
        const order = await tx.order.create({
          data: {
            release,
            region,
            isLayoff,
            message,
            isSend: !customerId, // Nếu chưa có customerId -> isSend: true (Đơn xả nội bộ)
            ...(customerId ? { customerId } : {}),
          },
        });

        // 2. Format dữ liệu OrderDetails trước khi insert
        const formattedDetails = details.map((item) => ({
          orderId: order.id,
          syntax: item.syntax,
          stationCode: item.stationCode,
          number: item.number,
          type: item.type,
          xac: item.xac,
          date: release,
          price: 0, // Đơn cân hàng chưa gửi chưa tính price
          co: 0, // Đơn cân hàng chưa gửi chưa tính co
          trung: 0,
          ...(customerId ? { customerId } : {}),
        }));

        // 3. Insert danh sách OrderDetails
        if (formattedDetails.length > 0) {
          await tx.orderDetails.createMany({
            data: formattedDetails,
          });
        }

        return {
          message: "Lưu tin cân bằng thành công!",
        };
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async findByDateWithCustomerId(payload: {
    customerId: string;
    release: string;
  }) {
    try {
      const { customerId, release } = payload;
      const orders = await this.prisma.order.findMany({
        where: { AND: [{ customerId }, { release }] },
        include: { details: true },
      });

      return {
        message: "Tìm kiếm tin nhắn thành công",
        orders,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async findById(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: { details: true },
      });
      if (!order)
        throw new NotFoundException("Không tìm thấy tin nhắn yêu cầu!");
      return {
        message: "Tìm kiếm tin nhắn thành công",
        order,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async findAllByDate(release: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { release },
        include: { details: true },
      });
      return {
        message: "Tìm kiếm tin nhắn thành công",
        orders,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async deleteById(id: string) {
    try {
      await this.prisma.order.delete({ where: { id } });
      return {
        message: "Xóa tin thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async deleteMany(ids: string[]) {
    try {
      await this.prisma.order.deleteMany({ where: { id: { in: ids } } });
      return {
        message: "Xóa tin thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
