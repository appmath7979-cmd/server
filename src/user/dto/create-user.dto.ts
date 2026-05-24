import { UserType } from "@prisma/client";
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "Username không được để trống!" })
  @IsString()
  @Length(3, 20, { message: "Username phải có ít nhất 3 ký tự" })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      "Tên đăng nhập chỉ được chứa chữ cái không dấu, chữ số và dấu gạch dưới (_)",
  })
  username: string;

  @IsNotEmpty({ message: "Mật khẩu không được để trống!" })
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
        "Mật khẩu phải tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt!",
    },
  )
  password: string;

  @IsNotEmpty()
  @IsEnum(UserType, { message: "Loại toài khoản không hợp lệ" })
  type: UserType;
}
