import { Role } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  MinLength,
} from "class-validator";
import { Escape, Trim } from "class-sanitizer";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: "Username phải có ít nhất 5 ký tự" })
  @Trim()
  @Escape()
  username: string;

  @IsNotEmpty()
  @IsPhoneNumber("VN", { message: "Số điện thoại không hợp lệ" })
  @Trim()
  phoneNumber: string;

  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
    },
  )
  @Trim()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
