import { Region } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateStandardPersonalDto {
  @IsNotEmpty()
  @IsNumber()
  day: number;

  @IsNotEmpty()
  @IsEnum(Region)
  region: Region;

  @IsNotEmpty()
  @IsString()
  stationCode: string;

  @IsNotEmpty()
  @IsNumber()
  value: number;

  @IsNotEmpty()
  @IsString()
  customerId: string;
}
