import { Role } from "@prisma/client";

export type UserResponseType = {
  id: string;
  username: string;
  phoneNumber: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
};
