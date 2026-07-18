import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSettingDto } from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";

@Injectable()
export class SettingService {
  constructor(private readonly prisma: PrismaService) {}

  async getByDay(day: number) {
    const settings = await this.prisma.setting.findMany({ where: { day } });
    return { message: "Tìm kiếm cấu hình thành công!", settings };
  }

  async createMany(data: CreateSettingDto[]) {
    try {
      const targetDay = data[0].day;

      const isDayExisted = await this.prisma.setting.findFirst({
        where: { day: targetDay },
      });

      if (isDayExisted) {
        throw new BadRequestException(
          `Thiết lập cho Ngày thứ ${targetDay} đã tồn tại trong hệ thống!`,
        );
      }

      await this.prisma.setting.createMany({ data });

      return {
        message: "Tạo thiết lập thành công!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async updateMany(data: UpdateSettingDto[]) {
    try {
      const targetDay = [...new Set(data.map((item) => item.day))];

      if (targetDay.length === 0 || targetDay.length > 1 || !targetDay[0])
        throw new BadRequestException("Ngày không hợp lệ!");

      const ids = data.map((item) => item.id);
      const payload: Omit<UpdateSettingDto, "id">[] = data.map((item) => ({
        day: item.day,
        provinceCode: item.provinceCode,
        region: item.region,
        score: item.score,
        syntax: item.syntax,
      }));

      await this.prisma.$transaction([
        this.prisma.setting.deleteMany({ where: { id: { in: ids } } }),
        this.prisma.setting.createMany({ data: payload }),
      ]);

      return { message: "Cập nhật thiết lập thành công!" };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
