import { IsNotEmpty, IsString } from "class-validator";

export class GetAuthDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
