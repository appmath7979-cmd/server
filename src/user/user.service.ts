import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}
}
