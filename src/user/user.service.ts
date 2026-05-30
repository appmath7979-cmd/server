import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ConfigService } from "@nestjs/config";
import "dotenv/config";
import { PasswordService } from "src/password/password.service";
import { GetUserDto } from "./dto/get-user.dto";
import {
  CreateUserType,
  FindUserByUsernameType,
  GetForSigninType,
} from "src/types/user.type";

@Injectable()
export class UserService {
  private readonly saltRounds: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {
    this.saltRounds = parseInt(
      this.configService.get<string>(process.env.BCRYPT_SALT_ROUNDS!) || "10",
      10,
    );
  }

  async create(data: CreateUserDto): Promise<CreateUserType> {
    const { password } = data;
    const hashPassword = await this.passwordService.hashPassword(
      password,
      this.saltRounds,
    );

    await this.prisma.user.create({
      data: { ...data, password: hashPassword },
    });
    return { message: "Đăng ký thành công." };
  }

  async findByUsername(username: string): Promise<FindUserByUsernameType> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return { message: "Không tìm thấy người dùng!", user: null };
    return { message: "Tìm kiếm tài khoản thành công.", user };
  }

  async getForSignin(data: GetUserDto): Promise<GetForSigninType> {
    const { username, password } = data;

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!existingUser)
      return {
        message:
          "Tài khoản không đúng hoặc không tồn tại. Kiểm tra lại username/mật khẩu!",
        user: null,
      };

    const { password: passwordFromDB, ...getUser } = existingUser;

    const isValidPassword = await this.passwordService.comparePassword(
      password,
      passwordFromDB,
    );

    if (!isValidPassword)
      return {
        message:
          "Tài khoản không đúng hoặc không tồn tại. Kiểm tra lại username/mật khẩu!",
        user: null,
      };

    return {
      message: "Đăng nhập thành công.",
      user: getUser,
    };
  }
}
