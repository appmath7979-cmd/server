import { CreateSettingDto } from "./create-setting.dto";
import { IsUUID } from "class-validator";

export class UpdateSettingDto extends CreateSettingDto {
  @IsUUID("4")
  id: string;
}
