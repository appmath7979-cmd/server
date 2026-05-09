import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreateUserDto } from "./dto/create-user.dto";
import { IBaseResponse } from "src/types/base.type";
import { UserResponseType } from "src/types/user.type";

@Injectable()
export class UserService {
  constructor(@Inject("PRISMA_CLIENT") private readonly prisma: PrismaClient) {}

  async createUser(data: CreateUserDto): Promise<IBaseResponse> {
    try {
      const { username, phoneNumber } = data;
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ username }, { phoneNumber }] },
      });

      if (user) throw new UnauthorizedException("Tài khoản đã tồn tại");

      await this.prisma.user.create({ data });
      return { message: "Tài khoản đã được tạo thành công" };
    } catch (error) {
      console.error("Error creating user:", error);
      throw new InternalServerErrorException("Đã xảy ra lỗi khi tạo tài khoản");
    }
  }

  async findUserByUsername(username: string): Promise<UserResponseType | null> {
    return await this.prisma.user.findUnique({ where: { username } });
  }
}
