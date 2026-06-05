import { CustomerType } from "@prisma/client";
import { Escape } from "class-sanitizer";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from "class-validator";
import { CreateSettingDto } from "./create-setting,dto";
import { Type } from "class-transformer";

export class CreateCustomerDto {
  @IsNotEmpty({ message: "Họ tên không được để trống!" })
  @IsString()
  @Escape()
  fullName: string;

  @IsNotEmpty({ message: "Số điện thoại không được để trống!" })
  @IsPhoneNumber("VN", { message: "Số điện thoại không hợp lệ!" })
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(CustomerType)
  type: CustomerType;

  @IsNotEmpty()
  @IsString()
  loaiCo: string;

  @IsNotEmpty()
  @IsBoolean()
  xienMB: boolean;

  @IsNotEmpty()
  @IsBoolean()
  tinhUi: boolean;

  @IsNotEmpty()
  @IsString()
  tinhTrungDaT: string;

  @IsNotEmpty()
  @IsString()
  tinhTrungDaX: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateSettingDto)
  settings: CreateSettingDto;
}
