import { Region } from "@prisma/client";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateRegionRewardDto {
  @IsEnum(Region)
  region: Region;

  @IsNotEmpty({ message: "Tên tỉnh/thành không được để trống" })
  @IsString()
  station: string;

  @IsArray()
  @IsString({ each: true })
  results: string[];
}
