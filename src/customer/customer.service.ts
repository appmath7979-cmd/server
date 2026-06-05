import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { message } from "src/constants/message.constanst";
import { Prisma, UserRole } from "@prisma/client";
import { instanceToPlain } from "class-transformer";

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCustomerDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!user) throw new NotFoundException("Người dùng không tồn tại!");

      const plainSettings = instanceToPlain(data.settings);

      await this.prisma.customer.create({
        data: {
          ...data,
          settings: plainSettings as Prisma.InputJsonValue,
          userId,
        },
      });

      return { message: "Tạo người dùng thành công" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(message);
    }
  }

  async findAllForUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { customers: true, _count: { select: { customers: true } } },
      });

      if (!user) throw new NotFoundException("Người dùng không tồn tại!");

      const { customers, _count } = user;

      return {
        message: "Tìm kiếm danh sách khách hàng thành công",
        customers,
        total: _count,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(message);
    }
  }

  async findAllForAdmin(
    userId: string,
    role: UserRole,
    limit: number,
    page: number,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: { role: true },
      });

      const skip = (page - 1) * limit;

      if (!user) throw new NotFoundException("Người dùng không tồn tại!");
      if (role !== user.role)
        throw new ForbiddenException("Không có quyền truy cập");

      const [customers, total] = await this.prisma.$transaction([
        this.prisma.customer.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.customer.count(),
      ]);

      return {
        message: "Tìm kiếm danh sách khách hàng thành công.",
        customers,
        total,
        page,
        totalPage: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(message);
    }
  }
}
