import { CustomerType, DaType } from "@prisma/client";
import { Escape } from "class-sanitizer";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from "class-validator";

class RegionValuesDto {
  @IsNumber()
  MB: number;

  @IsNumber()
  MT: number;

  @IsNumber()
  MN: number;
}

class BetPairDto {
  @IsEnum(["b2", "dd2", "da", "dax", "b3", "dd3", "b4"])
  name: "b2" | "dd2" | "da" | "dax" | "b3" | "dd3" | "b4";

  @ValidateNested()
  @Type(() => RegionValuesDto)
  c: RegionValuesDto;

  @ValidateNested()
  @Type(() => RegionValuesDto)
  t: RegionValuesDto;

  @IsEnum(["tile", "thanhtien"])
  type: "tile" | "thanhtien";
}

class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: "Họ và tên không được để trống!" })
  @Escape()
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: "Số điện thoại không được để trống!" })
  @IsPhoneNumber("VN", {
    message: "Số điện thoại không hợp lệ (phải gồm 10 số)!",
  })
  @Escape()
  phoneNumber: string;

  @IsEnum(CustomerType)
  type: CustomerType;

  @IsBoolean()
  tinhUi: boolean;

  @IsBoolean()
  xienMienBac: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BetPairDto)
  settings: BetPairDto[];

  @IsEnum(DaType)
  daxt: DaType;
}

export { CreateCustomerDto, BetPairDto };
