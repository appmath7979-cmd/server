import { OrderType, Region } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  IsUUID,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

class MessageScoreItemDto {
  @IsNumber()
  @IsNotEmpty()
  xac: number;

  @IsNumber()
  @IsNotEmpty()
  co: number;

  @IsNumber()
  @IsNotEmpty()
  trung: number;
}

class MessageValueItemDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MessageScoreItemDto)
  score: MessageScoreItemDto;
}

class GroupedBetItemDto {
  [betType: string]: Record<string, MessageValueItemDto[]>;
}

@ValidatorConstraint({ name: "isGroupedBetItem", async: false })
class IsGroupedBetItemConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return false;

    // Ép kiểu tầng ngoài cùng về Record của hệ thống
    const typedValue = value as Record<string, Record<string, unknown[]>>;

    for (const betType in typedValue) {
      const stations = typedValue[betType];
      if (!stations || typeof stations !== "object" || Array.isArray(stations))
        return false;

      for (const stationCode in stations) {
        const items = stations[stationCode];
        if (!Array.isArray(items)) return false;

        for (const item of items) {
          if (!item || typeof item !== "object" || Array.isArray(item))
            return false;

          // Giải pháp an toàn nhất cho ESLint: Ép kiểu tường minh qua Object Record
          const betItem = item as Record<string, unknown>;

          if (typeof betItem.number !== "string" || !betItem.number)
            return false;

          if (
            !betItem.score ||
            typeof betItem.score !== "object" ||
            Array.isArray(betItem.score)
          )
            return false;

          // Tiếp tục ép kiểu score về cấu trúc tường minh để chấm thuộc tính
          const score = betItem.score as Record<string, unknown>;

          if (
            typeof score.xac !== "number" ||
            typeof score.co !== "number" ||
            typeof score.trung !== "number"
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Cấu trúc dữ liệu tại phần tử thuộc mảng "${args.property}" không hợp lệ.`;
  }
}

class CreateOrderDto {
  @IsNotEmpty({ message: "Tên miền không được để trống!" })
  @IsEnum(Region, { message: "Tên miền không hợp lệ!" })
  region: Region;

  @IsArray()
  @Validate(IsGroupedBetItemConstraint, { each: true })
  results: GroupedBetItemDto[];

  @IsNotEmpty({ message: "Ngày tạo không được để trống!" })
  @IsString({ message: "Ngày tạo không đúng định dạng!" })
  dateRelease: string;

  @IsNotEmpty({ message: "Thời gian tạo không được để trống!" })
  @IsString({ message: "Thời gian tạo không đúng định dạng!" })
  timeRelease: string;

  @IsNotEmpty({ message: "Loại tin không được để trống!" })
  @IsEnum(OrderType, { message: "Loại đơn không hợp lệ!" })
  type: OrderType;

  @IsNotEmpty({ message: "Thông tin khách hàng không được để trống!" })
  @IsUUID("4", { message: "Thông tin khách hàng không đúng định dạng!" })
  customerId: string;
}

export { GroupedBetItemDto, MessageValueItemDto, CreateOrderDto };
