import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { CustomerType, DaType } from "@prisma/client";

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(data: CreateCustomerDto) {
    try {
      const { type, dat, daxt, phoneNumber } = data;

      const customer = await this.prisma.customer.findUnique({
        where: { phoneNumber },
        select: { id: true },
      });

      if (customer)
        throw new ConflictException("Khách hàng đã tồn tại. Vui lòng thử lại!");

      const typeFormat: CustomerType = type === "chu" ? "OWNER" : "GUEST";
      const datFormat: DaType =
        dat === "1 lần"
          ? "MOT_LAN"
          : dat === "ky rưỡi"
            ? "KY_RUOI"
            : "NHIEU_CAP";
      const daxtFormat: DaType =
        daxt === "1 lần"
          ? "MOT_LAN"
          : dat === "ky rưỡi"
            ? "KY_RUOI"
            : "NHIEU_CAP";

      await this.prisma.customer.create({
        data: {
          ...data,
          type: typeFormat,
          settings: JSON.parse(JSON.stringify(data.settings)),
          dat: datFormat,
          daxt: daxtFormat,
        },
      });

      return {
        message: "Tạo khách hàng thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async getAllCustomer() {
    try {
      const customers = await this.prisma.customer.findMany({
        select: {
          id: true,
          fullName: true,
          status: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const dataCustomers = customers.map((customer) =>
        customer.type === "GUEST"
          ? { ...customer, type: "khach" }
          : { ...customer, type: "chu" },
      );

      return {
        message: "Lấy danh sách khách hàng thành công.",
        customers: dataCustomers,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async getCustomerById(customerId: string) {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer)
        throw new NotFoundException(
          "Không tìm thấy khách hàng hoặc khách hàng không tồn tại!",
        );

      return {
        message: "Tìm kiếm khách hàng thành công",
        customer,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
