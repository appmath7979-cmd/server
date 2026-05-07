import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class RegionSettingDto {
  @IsNotEmpty()
  @IsString()
  regionName: string;

  @IsNotEmpty()
  @IsObject()
  coSetting: Record<string, any>;

  @IsNotEmpty()
  @IsObject()
  trungSetting: Record<string, any>;
}
