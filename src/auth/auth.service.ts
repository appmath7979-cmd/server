import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { SignUpDto } from "./dto/sign-up.dto";
import * as bcrypt from "bcrypt";
import { IBaseResponse } from "src/types/base.type";
import { SignInDto } from "./dto/sign-in.dto";
import { ISignInResponse } from "src/types/auth.type";
import { JwtService } from "@nestjs/jwt";
import "dotenv/config";

const saltOption = 16;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signUp(data: SignUpDto): Promise<IBaseResponse> {
    try {
      const hasedPassword = await bcrypt.hash(data.password, saltOption);
      const result = await this.userService.createUser({
        ...data,
        password: hasedPassword,
      });

      return result;
    } catch (error) {
      console.error("Error signing up:", error);
      throw new InternalServerErrorException(
        "Đã xảy ra lỗi khi đăng ký tài khoản",
      );
    }
  }

  async signIn(data: SignInDto): Promise<ISignInResponse> {
    try {
      const { username, password } = data;
      const user = await this.userService.findUserByUsername(username);

      if (!user)
        throw new UnauthorizedException("Tài khoản hoặc mật khẩu không đúng");

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid)
        throw new UnauthorizedException("Tài khoản hoặc mật khẩu không đúng");

      const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.REFRESH_SECRET_KEY,
        expiresIn: "1d",
      });

      const userWithoutPassword: Omit<typeof user, "password"> = {
        id: user.id,
        username: user.username,
        role: user.role,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        message: "Đăng nhập thành công",
      };
    } catch (error) {
      console.error("Error signing in:", error);
      throw new InternalServerErrorException(
        "Đã xảy ra lỗi khi đăng nhập vào tài khoản",
      );
    }
  }

  async refreshToken(userId: string) {
    try {
      const payload = { sub: userId };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.REFRESH_SECRET_KEY,
        expiresIn: "1d",
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error signing in:", error);
      throw new InternalServerErrorException("Đã xảy ra lỗi khi làm mới token");
    }
  }
}
