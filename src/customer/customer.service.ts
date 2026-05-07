import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Injectable()
export class CustomerService {
  constructor(@Inject("PRISMA_CLIENT") private readonly prisma: PrismaClient) {}

  async findCustomers() {
    try {
      return await this.prisma.customer.findMany();
    } catch (error) {
      console.error("Error finding customers:", error);
      throw new InternalServerErrorException("Lỗi khi tìm kiếm khách hàng.");
    }
  }

  async createCustomer(data: CreateCustomerDto) {
    try {
      const { setting, ...customerData } = data;
      await this.prisma.customer.create({
        data: {
          ...customerData,
          setting: {
            create: {
              loaiCo: setting.loaiCo,
              xienMienBac: setting.xienMienBac,
              tinhUi: setting.tinhUi,
              tinhTrungDaThang: setting.tinhTrungDaThang,
              tinhTrungDaXien: setting.tinhTrungDaXien,
              regions: {
                create: setting.regions.map((reg) => ({
                  regionName: reg.regionName,
                  coSetting: reg.coSetting,
                  trungSetting: reg.trungSetting,
                })),
              },
            },
          },
        },
        include: {
          setting: {
            include: {
              regions: true,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new InternalServerErrorException("Lỗi khi tạo mới khách hàng.");
    }
  }
}
