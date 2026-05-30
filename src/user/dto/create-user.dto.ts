import { UserType } from "@prisma/client";
import { Escape } from "class-sanitizer";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Username là bắt buộc!" })
  @IsString()
  @Escape()
  username: string;

  @IsNotEmpty({ message: "Tên hiển thị là bắt buộc!" })
  @IsString()
  @Escape()
  displayName: string;

  @IsNotEmpty({ message: "Mật khẩu là bắt buộc!" })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ thường, 1 chữ in hoa, 1 chữ số và 1 ký tự đặc biệt!",
    },
  )
  password: string;

  @IsOptional()
  @IsEnum(UserType)
  type: UserType;
}
