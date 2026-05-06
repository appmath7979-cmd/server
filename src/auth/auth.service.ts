import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaClient } from "@prisma/client";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { ISignInResponse, ISignUpResponse } from "src/types/auth.type";
import * as bcrypt from "bcrypt";
import { LoginAuthDto } from "./dto/login-auth.dto";
import { IBaseResponse } from "src/types/base.type";

const saltOrRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private jwtService: JwtService,
  ) {}

  async signUp(data: CreateAuthDto): Promise<ISignUpResponse> {
    try {
      const { username, phoneNumber, password } = data;

      const existingUser = await this.prisma.user.findFirst({
        where: { OR: [{ username }, { phoneNumber }] },
      });

      if (existingUser)
        throw new ConflictException("Username or phone number already exists");

      const hashedPassword = await bcrypt.hash(password, saltOrRounds);

      await this.prisma.user.create({
        data: { ...data, password: hashedPassword },
      });

      return {
        message: "Tạo tài khoản thành công",
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Lỗi khi tạo tài khoản, vui lòng thử lại sau",
      );
    }
  }

  async signIn(data: LoginAuthDto): Promise<ISignInResponse> {
    try {
      const { username, password } = data;

      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!existingUser)
        throw new ForbiddenException("Tài khoản hoặc mật khẩu không đúng");

      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password,
      );

      if (!isPasswordValid)
        throw new ForbiddenException("Tài khoản hoặc mật khẩu không đúng");

      const { password: _, ...userWithoutPassword } = existingUser;

      const accessTokenn = this.jwtService.sign(
        {
          sub: existingUser.id,
          username: existingUser.username,
          role: existingUser.role,
        },
        { expiresIn: "5m" },
      );

      const refreshToken = this.jwtService.sign(
        {
          sub: existingUser.id,
        },
        { expiresIn: "7d" },
      );
      return {
        message: "Đăng nhập thành công",
        user: userWithoutPassword,
        accessToken: accessTokenn,
        refreshToken: refreshToken,
        accessTokenExpiresIn: 5 * 60,
        refreshTokenExpiresIn: 7 * 24 * 60 * 60,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Lỗi khi đăng nhập, vui lòng thử lại sau",
      );
    }
  }

  async signOut(userId: string): Promise<IBaseResponse> {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { username: userId },
        select: { id: true },
      });

      if (!existingUser)
        throw new ForbiddenException("Lỗi khi đăng xuất, vui lòng thử lại sau");

      return {
        message: "Đăng xuất thành công",
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        "Lỗi khi đăng xuất, vui lòng thử lại sau",
      );
    }
  }
}
