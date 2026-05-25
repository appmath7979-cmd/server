import {
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateRegionRewardDto } from "./create-region-reward.dto";

export class CreateRewardDto {
  @IsNotEmpty({ message: "Ngày tháng không được để trống" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Ngày không đúng định dạng YYYY-MM-DD",
  })
  release: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRegionRewardDto)
  rewards: CreateRegionRewardDto[];
}
