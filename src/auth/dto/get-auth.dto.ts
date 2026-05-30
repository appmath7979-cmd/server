import { IsEmail, IsOptional } from "class-validator";
import { GetUserDto } from "src/user/dto/get-user.dto";

export class GetAuthDto extends GetUserDto {
  @IsOptional()
  @IsEmail({}, { message: "Email không hợp lệ!" })
  email?: string;
}
