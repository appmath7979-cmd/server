import { User } from "@prisma/client";
import { MessageType } from "./common.type";

type CreateUserType = MessageType;
type FindUserByUsernameType = MessageType & { user: { id: string } | null };

type GetForSigninType = MessageType & {
  user: Omit<User, "password"> | null;
  access_token?: string;
  refresh_token?: string;
};

export type { CreateUserType, FindUserByUsernameType, GetForSigninType };
