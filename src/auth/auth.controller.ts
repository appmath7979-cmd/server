import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GetAuthDto } from "./dto/get-auth.dto";
import { type Response } from "express";
import { CreateAuthDto } from "./dto/create-auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/sign-in")
  async signIn(
    @Body() data: GetAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { message, user, access_token, refresh_token } =
      await this.authService.get(data);

    if (access_token && refresh_token) {
    }

    return { message, user };
  }

  @Post("/sign-up")
  async signUp(@Body() data: CreateAuthDto) {
    const res = await this.authService.create(data);
    return res;
  }
}
