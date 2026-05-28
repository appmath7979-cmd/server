import { IsNotEmpty, IsString, Matches } from "class-validator";

export class GetRewardByTime {
  @IsNotEmpty({ message: "Ngày tháng không được để trống" })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Ngày không đúng định dạng YYYY-MM-DD",
  })
  release: string;
}
