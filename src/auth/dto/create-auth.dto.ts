import { IsEmail, IsOptional } from "class-validator";
import { CreateUserDto } from "src/user/dto/create-user.dto";

export class CreateAuthDto extends CreateUserDto {
  @IsOptional()
  @IsEmail({}, { message: "Email không hợp lệ!" })
  email?: string;
}
