import { Role } from "@prisma/client";

export interface IUser {
  id: string;
  username: string;
  phoneNumber: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
