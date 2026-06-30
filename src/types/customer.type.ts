import { CustomerType, Prisma } from "@prisma/client";
import { IDetailList, MessageType } from "./common.type";

interface ICustomer {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  phoneNumber: string;
  type: CustomerType;
  loaiCo: string;
  xienMB: boolean;
  tinhUi: boolean;
  tinhTrungDaT: string;
  tinhTrungDaX: string;
  settings: Prisma.JsonValue;
  userId: string | null;
}

type CustomerResType = {
  customers: ICustomer[];
} & MessageType &
  IDetailList;

interface IBetPair {
  key: string;
  label: string;
  c: number;
  t: number;
  loai: string;
}

interface ISetting {
  BAC?: IBetPair[];
  TRUNG?: IBetPair[];
  NAM?: IBetPair[];
}

export type { ICustomer, CustomerResType, IBetPair, ISetting };
