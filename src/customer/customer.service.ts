import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { instanceToPlain } from "class-transformer";
import { Prisma } from "@prisma/client";

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCustomerDto) {
    try {
      const plainSetting = instanceToPlain(data.settings);
      await this.prisma.customer.create({
        data: { ...data, settings: plainSetting },
      });

      return {
        message: "Tạo khách hàng thành công!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async getAllCustomer(userId: string) {
    try {
      const customers = await this.prisma.customer.findMany({
        where: { userId },
        select: {
          fullName: true,
          id: true,
          type: true,
        },
      });

      const total = customers.length;

      return {
        message: "Tìm kiếm khách hàng thành công!",
        customers,
        total,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async getCustomerById(id: string) {
    try {
      const customer = await this.prisma.customer.findUnique({ where: { id } });

      if (!customer)
        throw new NotFoundException({ message: "Khách hàng không tồn tại!" });

      return {
        message: "Tìm kiếm người dùng thành công!",
        customer,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async getCustomerSetting(id: string) {
    try {
      const customerSetting = await this.prisma.customer.findUnique({
        where: { id },
        select: {
          settings: true,
          tinhTrungDaT: true,
          tinhTrungDaX: true,
          tinhUi: true,
          type: true,
          xienMB: true,
        },
      });

      if (!customerSetting)
        throw new NotFoundException({ message: "Khách hàng không tồn tại!" });

      return {
        message: "Lấy thông tin người dùng thành công!",
        customerSetting,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async deleteManyCustomer(ids: string[]) {
    try {
      await this.prisma.customer.deleteMany({
        where: { id: { in: ids } },
      });

      return {
        message: "Xóa khách hàng thành công!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async deleteCustomerById(id: string) {
    try {
      await this.prisma.customer.delete({
        where: { id },
      });

      return {
        message: "Xóa khách hàng thành công!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        // Ném ra một lỗi HTTP 404 có nghĩa hoặc return thông báo tùy thuộc vào framework của bạn
        throw new NotFoundException(
          `Không tìm thấy khách hàng với ID: ${id} để xóa.`,
        );
      }
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
