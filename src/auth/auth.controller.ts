import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { GetAuthDto } from "./dto/get-auth.dto";
import type { Response } from "express";
import "dotenv/config";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/sign-up")
  async signUp(@Body() data: CreateAuthDto) {
    const res = await this.authService.create(data);
    return res;
  }

  @Post("/sign-in")
  async signIn(
    @Body() data: GetAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.get(data);
    const { access_token, refresh_token, ...user } = result;

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 5 * 60 * 1000,
    });

    res.cookie("refesh_token", refresh_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return user;
  }
}
