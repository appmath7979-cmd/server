import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class BetPairDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsNumber()
  c: number;

  @IsNotEmpty()
  @IsNumber()
  t: number;
}
