import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { userMessages } from "../constants/messages.constant";

const { createSuccess } = userMessages;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    await this.prisma.user.create({ data });
    return {
      message: createSuccess,
    };
  }

  async getUserByUsername(username: string, isLogin: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: isLogin,
        username: true,
        password: isLogin,
        type: isLogin,
        createdAt: isLogin,
        updatedAt: isLogin,
      },
    });

    return user;
  }
}
