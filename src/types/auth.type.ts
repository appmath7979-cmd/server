import { Role } from "@prisma/client";
import { IBaseResponse } from "./base.type";

export interface ISignInResponse extends IBaseResponse {
  user: {
    id: string;
    username: string;
    phoneNumber: string;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}
