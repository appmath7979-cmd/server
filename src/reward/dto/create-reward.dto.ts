import {
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateNested,
} from "class-validator";
import { CreateRegionRewardDto } from "./create-region-award";
import { Type } from "class-transformer";

export class CreateRewardDto {
  @IsNotEmpty({ message: "Ngày tạo không được để trống" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Ngày tạo phải đúng định dạng YYYY-MM-DD",
  })
  release: string;

  @IsArray({ message: "Danh sách phần thưởng tỉnh/thành phải là một mảng" })
  @ValidateNested({ each: true })
  @Type(() => CreateRegionRewardDto)
  rewards: CreateRegionRewardDto[];
}
