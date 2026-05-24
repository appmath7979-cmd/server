import { IsEmail, IsOptional } from "class-validator";
import { CreateUserDto } from "../../user/dto/create-user.dto";

export class CreateAuthDto extends CreateUserDto {
  @IsOptional()
  @IsEmail()
  validateEmail?: string;
}
