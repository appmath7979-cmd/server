import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt/dist/jwt.service";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(
        "Không thể đăng nhập, vui lòng thử lại sau",
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request["user"] = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        "Không thể đăng nhập, vui lòng thử lại sau",
      );
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
