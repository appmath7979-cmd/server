import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { IBetPair, ISetting } from "../types/customer.type";

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTransactionDto) {
    try {
      const { type, content, customerId } = data;
      if (type === "CO" || type === "TRUNG")
        throw new ForbiddenException({
          message: "Không có quyền với loại 'Cò' hoặc 'Trúng'!",
        });

      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { settings: true },
      });

      if (!customer)
        throw new NotFoundException({
          message: "Khách hàng không tìm thấy hoặc không tồn tại!",
        });

      const regionMapper: Record<typeof data.region, keyof ISetting> = {
        NORTH: "BAC",
        SOUTH: "NAM",
        CENTRAL: "TRUNG",
      };

      const settingKey = regionMapper[data.region];
      const settings = customer.settings as ISetting;
      const currentSetting = settings?.[settingKey] || [];

      const settingMap = new Map<string, IBetPair>(
        currentSetting.map((curr) => [curr.key, curr]),
      );

      const coCalc = content.map((item) => {
        const numberPair = item[1];
        if (!numberPair) return item;

        const length = numberPair.includes("-")
          ? numberPair.split("-")[0].length
          : numberPair.length;

        let syntaxCheck = "";

        if (
          item[2] === "dau" ||
          item[2] === "duoi" ||
          syntaxCheck === "xc" ||
          syntaxCheck === "xdau" ||
          syntaxCheck === "xduoi"
        )
          syntaxCheck = "dd";
        else syntaxCheck = item[2];

        const check = length === 2 ? syntaxCheck : `${length}${syntaxCheck}`;

        // Lúc này biên 'find' sẽ tự động hiểu thuộc tính của IBetPair (gợi ý chuẩn loai, c)
        const find = settingMap.get(check);

        if (find) {
          const currentScore = item[3];
          const coScore =
            find.loai === "thanh_tien"
              ? `${currentScore}*${find.c}`
              : `${currentScore}+${currentScore}*${find.c}`;

          const newItem = [...item];
          newItem[3] = coScore;
          return newItem;
        }
        return item;
      });

      // Gộp 2 hành động tạo bản ghi vào 1 Transaction duy nhất
      await this.prisma.$transaction([
        this.prisma.transaction.create({
          data,
        }),
        this.prisma.transaction.create({
          data: {
            ...data,
            type: "CO",
            content: coCalc,
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        "Lỗi hệ thống khi xử lý giao dịch!",
      );
    }
  }

  async findAll(customerId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { customerId },
    });

    return {
      message: "Tìm kiếm tin nhắn thành công.",
      transactions,
    };
  }
}
