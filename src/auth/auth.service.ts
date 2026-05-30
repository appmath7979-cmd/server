import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { message } from "src/constants/message.constanst";
import "dotenv/config";
import { GetAuthDto } from "./dto/get-auth.dto";

@Injectable()
export class AuthService {
  constructor(private readonly user: UserService) {}

  async create(data: CreateAuthDto) {
    try {
      const { email, username } = data;

      const { user } = await this.user.findByUsername(username);

      if (user)
        throw new ConflictException(
          "Tài khoản không hợp lệ. Vui lòng  thử lại!",
        );

      const { message } = await this.user.create({
        ...data,
        type: email && email === process.env.EMAIL ? "ADMIN" : "USER",
      });

      return { message };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(message);
    }
  }

  async get(data: GetAuthDto) {
    try {
      const { email, ...userData } = data;
      const { message, user, access_token, refresh_token } =
        await this.user.getForSignin(userData);

      if (!user || (user && user.type === "ADMIN" && !email))
        throw new ForbiddenException(message);

      return { message, user, access_token, refresh_token };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(message);
    }
  }
}
