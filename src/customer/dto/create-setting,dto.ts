import { IsArray } from "class-validator";
import { BetPairDto } from "./create-bet-pair.dto";
import { Type } from "class-transformer";

export class CreateSettingDto {
  @IsArray()
  @Type(() => BetPairDto)
  BAC: BetPairDto[];

  @IsArray()
  @Type(() => BetPairDto)
  TRUNG: BetPairDto[];

  @IsArray()
  @Type(() => BetPairDto)
  NAM: BetPairDto[];
}
