import { Region } from "@prisma/client";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Escape } from "class-sanitizer";

export class CreateRegionRewardDto {
  @IsNotEmpty()
  @IsEnum(Region, { message: "Miền không phù hợp!" })
  region: Region;

  @IsNotEmpty({ message: "Tên tỉnh/thành không được để trống!" })
  @IsString()
  @Escape()
  station: string;

  @IsArray({ message: "Danh sách kết quả không đúng định dạng!" })
  @IsString({
    each: true,
    message: "Kết quả phải là chuỗi!",
  })
  results: string[];
}
