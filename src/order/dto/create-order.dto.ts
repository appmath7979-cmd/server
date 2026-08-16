import { Region } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class CreateOrderDetailsDto {
  @IsNotEmpty()
  @IsString()
  syntax: string;

  @IsNotEmpty()
  @IsString()
  stationCode: string;

  @IsNotEmpty()
  @IsString()
  number: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsNotEmpty()
  @IsNumber()
  xac: number;
}

class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  release: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsBoolean()
  isLayoff: boolean;

  @IsNotEmpty()
  @IsEnum(Region)
  region: Region;

  @IsArray()
  @IsNotEmpty({ message: "Danh sách số đánh không được để trống!" })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailsDto)
  details: CreateOrderDetailsDto[];

  @IsOptional()
  @IsString()
  customerId?: string;
}

export { CreateOrderDto, CreateOrderDetailsDto };
