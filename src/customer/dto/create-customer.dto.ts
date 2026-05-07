import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  Matches,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CustomerType } from "@prisma/client";
import { CreateSettingDto } from "./create-setting.dto";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: "Tên khách hàng không được để trống" })
  fullName: string;

  @IsOptional()
  @Matches(/^(0[35789])[0-9]{8}$/, {
    message: "Số điện thoại không đúng định dạng Việt Nam",
  })
  phoneNumber?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  type?: CustomerType;

  @ValidateNested()
  @Type(() => CreateSettingDto)
  @IsNotEmpty()
  setting: CreateSettingDto;
}
