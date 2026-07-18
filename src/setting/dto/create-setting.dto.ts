import { Region } from "@prisma/client";
import { IsEnum, IsInt, IsNumber, IsString, Max, Min } from "class-validator";

export class CreateSettingDto {
  @IsInt()
  @Min(0)
  @Max(6)
  day: number;

  @IsString()
  syntax: string;

  @IsString()
  provinceCode: string;

  @IsEnum(Region)
  region: Region;

  @IsNumber()
  @Min(0)
  score: number;
}
