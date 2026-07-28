import { Region } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

class GetOrderDto {
  @IsNotEmpty()
  @IsString()
  release?: string;

  @IsOptional()
  isLayoff?: boolean;

  @IsOptional()
  isSend?: boolean;

  @IsNotEmpty()
  @IsEnum(Region)
  region: Region;
}

class GetOrderByCustomerId {
  @IsNotEmpty()
  @IsUUID("4", { message: "Mã khách hàng không hợp lệ" })
  customerId: string;

  @IsNotEmpty()
  @IsEnum(Region)
  region: Region;

  @IsNotEmpty()
  @IsString()
  release: string;
}

export { GetOrderDto, GetOrderByCustomerId };
