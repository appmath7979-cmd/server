import { IBaseResponse } from "./base.type";
import { IUser } from "./user.type";

export interface ISignUpResponse extends IBaseResponse {}
export interface ISignInResponse extends IBaseResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}
