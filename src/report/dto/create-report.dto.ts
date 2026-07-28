import { Region } from "@prisma/client";
import { Escape } from "class-sanitizer";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from "class-validator";

class CreateReportDetailDto {
  @IsNotEmpty()
  @IsEnum(Region)
  region: Region;

  @IsNotEmpty()
  @IsString()
  @Escape()
  release: string;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsString()
  @Escape()
  type: string;

  @IsNotEmpty()
  @IsString()
  @Escape()
  syntax: string;

  @IsNotEmpty()
  @IsString()
  @Escape()
  provinceCode: string;

  @IsNotEmpty()
  @IsString()
  @Escape()
  number: string;
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
