import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Region } from "@prisma/client";
import { BetPairDto } from "../customer/dto/create-customer.dto";
import { GetOrderByCustomerId, GetOrderDto } from "./dto/get-order.dto";

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private getDbSettingName(type: string, syntax: string): string {
    const currentType = (type || "").toLowerCase().trim();
    const currentSyntax = (syntax || "").toLowerCase().trim();

    // 1. Nhóm Bao lô
    if (currentType === "bao" || currentType === "b") {
      if (currentSyntax === "2c" || currentSyntax === "2") return "b2";
      if (currentSyntax === "3c" || currentSyntax === "3") return "b3";
      if (currentSyntax === "4c" || currentSyntax === "4") return "b4";
    }

    // 2. Nhóm Đầu, Đuôi, Đầu Đuôi (2c -> dd2, 3c -> dd3)
    if (["dd", "dau", "duoi", "xdau", "xduoi", "xc"].includes(currentType)) {
      if (currentSyntax === "2c" || currentSyntax === "2") return "dd2";
      if (currentSyntax === "3c" || currentSyntax === "3") return "dd3";
    }

    // 3. Nhóm Đá
    if (currentType === "da") return "da";

    // 4. Nhóm Đá xiên
    if (["dax", "dx", "da_xien"].includes(currentType)) return "dax";

    return currentType;
  }

  private normalizeStationCode(code: string): string {
    const upperCode = (code || "").toUpperCase().trim();
    if (upperCode === "HCM") {
      return "TP";
    }
    return upperCode;
  }

  async createOrder(payload: CreateOrderDto) {
    try {
      const {
        customerId,
        release,
        region,
        isLayoff,
        details,
        message: rawMessage,
      } = payload;

      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, settings: true, dat: true, daxt: true },
      });

      if (!customer)
        throw new NotFoundException(
          "Không tìm thấy người dùng hoặc người dùng không hợp lệ để lưu tin nhắn!",
        );

      const { settings } = customer;
      const customerSettings = (settings as unknown as BetPairDto[]) || [];

      await this.prisma.$transaction(async (tx) => {
        // 1. Tạo đơn hàng (Order) gốc
        const order = await tx.order.create({
          data: {
            release,
            isLayoff,
            region,
            customerId,
            message: rawMessage,
          },
        });

        // Kiểm tra xem ngày hôm đó đã có kết quả xổ số (Reward) chưa
        const rewards = await tx.reward.findMany({
          where: { release, region },
        });
        const hasReward = rewards.length > 0;

        // 2. Tính toán và lưu danh sách dòng cược chi tiết
        for (const item of details) {
          const regionKey: Region =
            item.stationCode === "MB"
              ? "MB"
              : item.stationCode === "MN"
                ? "MN"
                : item.stationCode === "MT"
                  ? "MT"
                  : region;

          const dbSettingName = this.getDbSettingName(
            item.type ?? "",
            item.syntax ?? "",
          );

          const setting = customerSettings.find(
            (s) => s.name === dbSettingName,
          );

          // XÁC ĐỊNH HỆ SỐ LÔ (MULTIPLIER) CHO CÒ (Áp dụng cho b2, da, dax)
          let multiplier = 1;
          if (
            dbSettingName === "b2" ||
            dbSettingName === "da" ||
            dbSettingName === "dax"
          ) {
            multiplier = regionKey === "MB" ? 27 : 18;
          } else if (dbSettingName === "b3") {
            multiplier = regionKey === "MB" ? 23 : 17;
          } else if (dbSettingName === "b4") {
            multiplier = regionKey === "MB" ? 20 : 16;
          }

          const coValue =
            setting && setting.c && setting.c[regionKey] !== undefined
              ? Number(setting.c[regionKey])
              : 0;

          const settingType = setting ? setting.type : "tile";

          // Nếu là tile thì nhân hệ số, nếu là thuhien/thanh_tien thì giữ nguyên
          const priceCalculated =
            settingType === "tile" ? coValue * multiplier : coValue;
          const coCalculated = item.xac * priceCalculated;

          // Lấy giá trị tiền trúng thưởng cấu hình
          const winValue =
            setting && setting.t && setting.t[regionKey] !== undefined
              ? Number(setting.t[regionKey])
              : 0;

          let soConTrung = 0;
          let totalWinMoney = 0;

          // NẾU ĐÃ CÓ KẾT QUẢ XỔ SỐ TRONG NGÀY THÌ TIẾN HÀNH DÒ SỐ VÀ TÍNH TIỀN TRÚNG
          if (hasReward) {
            const cleanTargetNum = (item.number || "").trim();
            const currentType = (item.type || "").toLowerCase().trim();
            const stationCodeNormalized = this.normalizeStationCode(
              item.stationCode,
            );

            const matchedRewards = rewards.filter((r) => {
              if (region === Region.MB) return true;
              return (
                this.normalizeStationCode(r.provinceCode) ===
                stationCodeNormalized
              );
            });

            if (matchedRewards.length > 0) {
              const reward = matchedRewards[0];
              const allRewardNumbers = [
                ...(reward.gdb || []),
                ...(reward.g1 || []),
                ...(reward.g2 || []),
                ...(reward.g3 || []),
                ...(reward.g4 || []),
                ...(reward.g5 || []),
                ...(reward.g6 || []),
                ...(reward.g7 || []),
                ...(reward.g8 || []),
              ];

              // A. BAO 2 CÀNG (b2)
              if (dbSettingName === "b2") {
                const target = cleanTargetNum.padStart(2, "0");
                soConTrung = allRewardNumbers.filter((numStr) => {
                  if (!numStr || numStr.length < 2) return false;
                  return numStr.slice(-2) === target;
                }).length;
              }
              // B. BAO 3 CÀNG (b3)
              else if (dbSettingName === "b3") {
                const target = cleanTargetNum.padStart(3, "0");
                const validRewardNumbers: string[] =
                  regionKey === "MB"
                    ? [
                        ...(reward.gdb || []),
                        ...(reward.g1 || []),
                        ...(reward.g2 || []),
                        ...(reward.g3 || []),
                        ...(reward.g4 || []),
                        ...(reward.g5 || []),
                        ...(reward.g6 || []),
                      ]
                    : [
                        ...(reward.gdb || []),
                        ...(reward.g1 || []),
                        ...(reward.g2 || []),
                        ...(reward.g3 || []),
                        ...(reward.g4 || []),
                        ...(reward.g5 || []),
                        ...(reward.g6 || []),
                        ...(reward.g7 || []),
                      ];

                soConTrung = validRewardNumbers.filter((numStr) => {
                  if (!numStr || numStr.length < 3) return false;
                  return numStr.slice(-3) === target;
                }).length;
              }
              // C. BAO 4 CÀNG (b4)
              else if (dbSettingName === "b4") {
                const target = cleanTargetNum.padStart(4, "0");
                const validRewardNumbers: string[] =
                  regionKey === "MB"
                    ? [
                        ...(reward.gdb || []),
                        ...(reward.g1 || []),
                        ...(reward.g2 || []),
                        ...(reward.g3 || []),
                        ...(reward.g4 || []),
                        ...(reward.g5 || []),
                      ]
                    : [
                        ...(reward.gdb || []),
                        ...(reward.g1 || []),
                        ...(reward.g2 || []),
                        ...(reward.g3 || []),
                        ...(reward.g4 || []),
                        ...(reward.g5 || []),
                        ...(reward.g6 || []),
                      ];

                soConTrung = validRewardNumbers.filter((numStr) => {
                  if (!numStr || numStr.length < 4) return false;
                  return numStr.slice(-4) === target;
                }).length;
              }
              // D. 2 CÀNG ĐẦU ĐUÔI (dd2)
              else if (dbSettingName === "dd2") {
                const target = cleanTargetNum.padStart(2, "0");
                const dauNumbers =
                  regionKey === "MB" ? reward.g7 || [] : reward.g8 || [];
                const duoiNumbers = reward.gdb || [];

                const countDau = dauNumbers.filter(
                  (num: string) => num && num.endsWith(target),
                ).length;
                const countDuoi = duoiNumbers.filter(
                  (num: string) => num && num.endsWith(target),
                ).length;

                if (["dau", "xdau"].includes(currentType)) {
                  soConTrung = countDau;
                } else if (["duoi", "xduoi"].includes(currentType)) {
                  soConTrung = countDuoi;
                } else {
                  soConTrung = countDau + countDuoi;
                }
              }
              // E. 3 CÀNG ĐẦU ĐUÔI / XỈU CHỦ (dd3 / xc)
              else if (dbSettingName === "dd3") {
                const target = cleanTargetNum.padStart(3, "0");
                const xiuDauNumbers =
                  regionKey === "MB" ? reward.g6 || [] : reward.g7 || [];
                const xiuDuoiNumbers = reward.gdb || [];

                const countXiuDau = xiuDauNumbers.filter(
                  (num: string) => num && num.endsWith(target),
                ).length;
                const countXiuDuoi = xiuDuoiNumbers.filter(
                  (num: string) => num && num.endsWith(target),
                ).length;

                if (["xdau", "dau"].includes(currentType)) {
                  soConTrung = countXiuDau;
                } else if (["xduoi", "duoi"].includes(currentType)) {
                  soConTrung = countXiuDuoi;
                } else if (["xc", "dd"].includes(currentType)) {
                  soConTrung = countXiuDau + countXiuDuoi;
                }
              }
              // F. ĐÁ (da)
              else if (dbSettingName === "da") {
                const targetNumbers = (item.number || "")
                  .split(/[-,\s]+/)
                  .map((n) => n.trim().padStart(2, "0"))
                  .filter((n) => n.length === 2);

                if (targetNumbers.length >= 2) {
                  const allTail2Numbers = allRewardNumbers
                    .filter((numStr) => numStr && numStr.length >= 2)
                    .map((numStr) => numStr.slice(-2));

                  // Đếm tổng số lần các con số trong cược xuất hiện trong kết quả xổ số
                  let totalHits = 0;
                  for (const rewardNum of allTail2Numbers) {
                    if (targetNumbers.includes(rewardNum)) {
                      totalHits++;
                    }
                  }

                  let totalPairsScore = 0;
                  if (totalHits >= 2) {
                    const fullPairs = Math.floor(totalHits / 2);
                    const remainder = totalHits % 2;
                    totalPairsScore = fullPairs + remainder * 0.5;
                  }

                  soConTrung = totalPairsScore;
                }
              }
              // G. ĐÁ XIÊN (dax)
              else if (dbSettingName === "dax") {
                const allTail2Numbers = allRewardNumbers
                  .filter((numStr) => numStr && numStr.length >= 2)
                  .map((numStr) => numStr.slice(-2));

                const targetNumbers = (item.number || "")
                  .split(/[-,\s]+/)
                  .map((n) => n.trim().padStart(2, "0"))
                  .filter((n) => n.length === 2);

                if (targetNumbers.length >= 2) {
                  let matchedPairsCount = 0;
                  for (let i = 0; i < targetNumbers.length; i++) {
                    for (let j = i + 1; j < targetNumbers.length; j++) {
                      const num1 = targetNumbers[i];
                      const num2 = targetNumbers[j];
                      const count1 = allTail2Numbers.filter(
                        (n) => n === num1,
                      ).length;
                      const count2 = allTail2Numbers.filter(
                        (n) => n === num2,
                      ).length;

                      if (num1 === num2) {
                        if (count1 >= 2)
                          matchedPairsCount += (count1 * (count1 - 1)) / 2;
                      } else {
                        if (count1 > 0 && count2 > 0)
                          matchedPairsCount += count1 * count2;
                      }
                    }
                  }
                  soConTrung = matchedPairsCount;
                }
              }

              // TÍNH TIỀN TRÚNG NẾU CÓ TRÚNG
              if (soConTrung > 0) {
                const xacValue = item.xac ? Number(item.xac) : 1;

                if (dbSettingName === "da") {
                  totalWinMoney = winValue * xacValue * soConTrung;
                } else if (dbSettingName === "dax") {
                  const daxtConfig = customer?.daxt;
                  let multiplierWin = 1;
                  if (daxtConfig === "KY_RUOI") {
                    multiplierWin = soConTrung === 1 ? 1.5 : 1;
                  } else if (daxtConfig === "NHIEU_CAP") {
                    multiplierWin = soConTrung;
                  } else {
                    multiplierWin = 1;
                  }
                  totalWinMoney =
                    soConTrung * winValue * xacValue * multiplierWin;
                } else {
                  totalWinMoney = soConTrung * winValue * xacValue;
                }
              }
            }
          }

          await tx.orderDetails.create({
            data: {
              orderId: order.id,
              customerId,
              date: release,
              syntax: item.syntax,
              stationCode: item.stationCode,
              number: item.number,
              type: item.type,
              xac: item.xac,
              price: priceCalculated,
              co: coCalculated,
              trung: totalWinMoney,
            },
          });
        }
      });

      return {
        message: "Tạo tin nhắn và tính toán thành công!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async createLayoff(payload: CreateOrderDto) {
    try {
      const { customerId, details, release, region, isLayoff, message } =
        payload;

      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            release,
            region,
            isLayoff,
            message,
            isSend: !customerId,
            ...(customerId ? { customerId } : {}),
          },
        });

        const formattedDetails = details.map((item) => ({
          orderId: order.id,
          syntax: item.syntax,
          stationCode: item.stationCode,
          number: item.number,
          type: item.type,
          xac: item.xac,
          date: release,
          price: 0,
          co: 0,
          trung: 0,
          ...(customerId ? { customerId } : {}),
        }));

        if (formattedDetails.length > 0) {
          await tx.orderDetails.createMany({
            data: formattedDetails,
          });
        }

        return {
          message: "Lưu tin cân bằng thành công!",
        };
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async findByDateWithCustomerId(payload: GetOrderByCustomerId) {
    try {
      const { customerId, release, region } = payload;
      const orders = await this.prisma.order.findMany({
        where: { AND: [{ customerId }, { release }, { region }] },
        include: { details: true },
      });

      return {
        message: "Tìm kiếm tin nhắn thành công",
        orders,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async findById(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: { details: true },
      });
      if (!order)
        throw new NotFoundException("Không tìm thấy tin nhắn yêu cầu!");
      return {
        message: "Tìm kiếm tin nhắn thành công",
        order,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async findAll(queries: GetOrderDto) {
    try {
      const { release, isLayoff, region, isSend } = queries;

      const getValue = (val: boolean | undefined | string) => {
        if (val === "true" || val === true) return true;
        if (val === "false" || val === false) return false;
        return undefined;
      };

      const orders = await this.prisma.order.findMany({
        where: {
          release,
          region,
          isLayoff: getValue(isLayoff),
          isSend: getValue(isSend),
        },
        include: { details: true },
      });
      return {
        message: "Tìm kiếm tin nhắn thành công",
        orders,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async deleteById(id: string) {
    try {
      await this.prisma.order.delete({ where: { id } });
      return {
        message: "Xóa tin thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async deleteMany(ids: string[]) {
    try {
      await this.prisma.order.deleteMany({ where: { id: { in: ids } } });
      return {
        message: "Xóa tin thành công",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
