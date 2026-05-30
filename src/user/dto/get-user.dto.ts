import { IsNotEmpty, IsString } from "class-validator";

export class GetUserDto {
  @IsNotEmpty({ message: "Username là bắt buộc!" })
  @IsString()
  username: string;

  @IsNotEmpty({ message: "Mật khẩu là bắt buộc!" })
  @IsString()
  password: string;
}
