import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/sign-up.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { type Response } from "express";
import "dotenv/config";

const accessTokenExpiration = 5 * 60 * 1000; // 5 minutes in milliseconds
const refreshTokenExpiration = 24 * 60 * 60 * 1000; // 1 day in milliseconds

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post("/signup")
  async signUp(@Body() data: SignUpDto) {
    const res = await this.authService.signUp(data);
    return res;
  }

  @HttpCode(HttpStatus.OK)
  @Post("/signin")
  async signIn(
    @Body() data: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken, message } =
      await this.authService.signIn(data);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: accessTokenExpiration,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: refreshTokenExpiration,
    });

    return {
      user,
      message,
    };
  }
}
