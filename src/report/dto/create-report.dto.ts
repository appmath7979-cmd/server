import { CustomerType, Region } from "@prisma/client";
import { Escape } from "class-sanitizer";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";

class CreateReportDetailDto {
  region: Region;
  release: string;
  value: number;
  type: string;
  syntax: string;
  // provinceCode: string;
  number: string;
  fullName: string;
  customerId: string;
  customerType: CustomerType;
}

class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  @Escape()
  release: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReportDetailDto)
  details: CreateReportDetailDto[];

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsNotEmpty()
  @IsNumber()
  totalMB: number;

  @IsNotEmpty()
  @IsNumber()
  totalMT: number;

  @IsNotEmpty()
  @IsNumber()
  totalMN: number;
}

export { CreateReportDto, CreateReportDetailDto };
