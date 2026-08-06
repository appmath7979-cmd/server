import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(data: CreateCustomerDto) {
    try {
      const { phoneNumber } = data;

      await this.prisma.$transaction(async (tx) => {
        const cus = await tx.customer.findUnique({
          where: { phoneNumber },
          select: { id: true },
        });

        if (cus) throw new ConflictException("Khách hàng đã tồn tại");

        const cusCreated = await this.prisma.customer.create({
          data: {
            ...data,
            settings: JSON.parse(JSON.stringify(data.settings)),
          },
          select: { id: true },
        });

        const user = await tx.user.findUnique({
          where: { phoneNumber },
          select: { id: true },
        });

        if (user) {
          await this.prisma.userConnection.create({
            data: { targetId: cusCreated.id, userId: user.id },
          });
        } else {
          await this.prisma.userConnection.create({
            data: { targetId: cusCreated.id },
          });
        }
      });

      return {
        message: "Tạo khách hàng thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async getAllCustomer({
    order = false,
    release,
  }: {
    order?: boolean;
    release?: string;
  }) {
    try {
      const select =
        order && release
          ? {
              id: true,
              fullName: true,
              status: true,
              type: true,
              orders: {
                where: { release },
                select: { message: true },
              },
              createdAt: true,
              updatedAt: true,
            }
          : {
              id: true,
              fullName: true,
              status: true,
              type: true,
              createdAt: true,
              updatedAt: true,
            };

      const customers = await this.prisma.customer.findMany({ select });

      return {
        message: "Lấy danh sách khách hàng thành công.",
        customers,
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
        include: {
          orders: true,
        },
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
