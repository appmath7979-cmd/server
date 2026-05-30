import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class PasswordService {
  constructor() {}

  async hashPassword(password: string, saltRounds: number): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(
    password: string,
    passwordFromDB: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, passwordFromDB);
  }
}
