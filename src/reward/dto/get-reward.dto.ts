import { IsNotEmpty, IsString, Matches } from "class-validator";

export class GetRewardDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Ngày tạo phải đúng định dạng YYYY-MM-DD",
  })
  release: string;
}
