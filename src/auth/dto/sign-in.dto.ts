import { Escape, Trim } from "class-sanitizer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  @Escape()
  username: string;

  @IsNotEmpty()
  @IsString()
  @Trim()
  password: string;

  @IsOptional()
  isRemember: boolean;
}
