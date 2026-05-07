import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import { RegionSettingDto } from "./region-setting.dto";

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  loaiCo: string;

  @IsBoolean()
  xienMienBac: boolean;

  @IsBoolean()
  tinhUi: boolean;

  @IsString()
  @IsNotEmpty()
  tinhTrungDaThang: string;

  @IsString()
  @IsNotEmpty()
  tinhTrungDaXien: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegionSettingDto)
  regions: RegionSettingDto[]; // Danh sách 3 miền
}
