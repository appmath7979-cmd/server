import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
} from "class-validator";

import { Region, TransactionType } from "@prisma/client";

export class CreateTransactionDto {
  @IsNotEmpty({ message: "Miền không được để trống!" })
  @IsEnum(Region, { message: "Miền không hợp lệ!" })
  region: Region;

  @IsNotEmpty({ message: "Ngày tháng không được để trống" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Ngày không đúng định dạng YYYY-MM-DD",
  })
  release: string;

  @IsNotEmpty({ message: "Nội dung tin nhắn không được để trống" })
  @IsArray()
  @IsArray({ each: true })
  content: Array<string[]>;

  @IsNotEmpty()
  @IsString()
  createTime: string;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsUUID("4", { message: "Người dùng không hợp lệ!" })
  customerId: string;
}
