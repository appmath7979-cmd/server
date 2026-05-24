import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { UserService } from "../user/user.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { userMessages } from "../constants/messages.constant";
import { hash, compare } from "bcrypt";
import { GetAuthDto } from "./dto/get-auth.dto";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../constants/jwt.constanst";

const { conflict, createForbidden, createServerError, incorrectUser } =
  userMessages;
const saltRound = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly user: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async create(data: CreateAuthDto) {
    try {
      const { username, validateEmail, type, password } = data;

      if (type === "ADMIN") {
        const email = "example@email.com";
        if (email !== validateEmail)
          throw new ForbiddenException(createForbidden);
      }

      const existingUser = await this.user.getUserByUsername(username, false);

      if (existingUser) throw new ConflictException(conflict);

      const hashPassword = await hash(password, saltRound);

      const created = await this.user.createUser({
        username,
        type,
        password: hashPassword,
      });
      return created;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(createServerError);
    }
  }

  async get(data: GetAuthDto) {
    try {
      const findUser = await this.user.getUserByUsername(data.username, true);
      if (!findUser) throw new ForbiddenException(incorrectUser);

      const isPasswordValid = await compare(data.password, findUser.password);

      if (!isPasswordValid) throw new ForbiddenException(incorrectUser);

      const { id, username, type, createdAt, updatedAt } = findUser;

      const payload = { sub: id, username };

      const access_token = await this.jwtService.signAsync(payload);
      const refresh_token = await this.jwtService.signAsync(
        { sub: id },
        { secret: jwtConstants.refresh, expiresIn: "1d" },
      );

      const user = {
        id,
        username,
        type,
        createdAt,
        updatedAt,
      };

      return {
        message: "Đăng nhập tài khoản thành công",
        user,
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(createServerError);
    }
  }
}
