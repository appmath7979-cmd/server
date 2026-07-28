import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRewardDto } from "./dto/create-reward.dto";
import { Region, Reward } from "@prisma/client";
import { BetPairDto } from "../customer/dto/create-customer.dto";

@Injectable()
export class RewardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Chuẩn hóa tên cấu hình trong DB (Đồng bộ với OrderService)
   */
  private getDbSettingName(type: string, syntax: string): string {
    const currentType = (type || "").toLowerCase().trim();
    const currentSyntax = (syntax || "").toLowerCase().trim();

    // 1. Nhóm Bao lô
    if (currentType === "bao" || currentType === "b") {
      if (currentSyntax === "2c" || currentSyntax === "2") return "b2";
      if (currentSyntax === "3c" || currentSyntax === "3") return "b3";
      if (currentSyntax === "4c" || currentSyntax === "4") return "b4";
    }

    // 2. Nhóm Đầu, Đuôi, Đầu Đuôi (2c -> dd2, 3c -> dd3 / xc)
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

  /**
   * Helper: Đồng bộ mã đài (Ví dụ: "HCM" quy đổi về "TP")
   */
  private normalizeStationCode(code: string): string {
    const upperCode = (code || "").toUpperCase().trim();
    if (upperCode === "HCM") {
      return "TP";
    }
    return upperCode;
  }

  /**
   * API CHÍNH: Lưu/Cập nhật KQXS và Tự động Dò Số & Tính Tiền Trúng
   */
  async create(data: CreateRewardDto[]) {
    try {
      if (!data || data.length === 0) {
        return { message: "Không có dữ liệu KQXS để lưu!" };
      }

      await this.prisma.$transaction(async (tx) => {
        // =========================================================
        // 1. UPSERT DỮ LIỆU KQXS VÀO DATABASE
        // =========================================================
        const savedRewards = await Promise.all(
          data.map(async (item): Promise<Reward> => {
            return await tx.reward.upsert({
              where: {
                provinceCode_release: {
                  provinceCode: item.provinceCode,
                  release: item.release,
                },
              },
              update: {
                region: item.region,
                gdb: item.gdb,
                g1: item.g1,
                g2: item.g2,
                g3: item.g3,
                g4: item.g4,
                g5: item.g5,
                g6: item.g6,
                g7: item.g7,
                g8: item.g8,
              },
              create: {
                provinceCode: item.provinceCode,
                release: item.release,
                region: item.region,
                gdb: item.gdb,
                g1: item.g1,
                g2: item.g2,
                g3: item.g3,
                g4: item.g4,
                g5: item.g5,
                g6: item.g6,
                g7: item.g7,
                g8: item.g8,
              },
            });
          }),
        );

        // =========================================================
        // 2. TỰ ĐỘNG DÒ SỐ VÀ CẬP NHẬT CỘT `trung`
        // =========================================================
        for (const reward of savedRewards) {
          const isMB = reward.region === Region.MB;
          const rewardProvinceCodeNormalized = this.normalizeStationCode(
            reward.provinceCode,
          );

          const orderDetailsWhere: any = {
            date: reward.release,
            order: { region: reward.region },
          };

          const orderDetails = await tx.orderDetails.findMany({
            where: orderDetailsWhere,
            include: {
              order: {
                include: { customer: true },
              },
            },
          });

          if (orderDetails.length === 0) continue;

          // Gom toàn bộ giải số của đài đang xét
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

          for (const detail of orderDetails) {
            if (!isMB) {
              const detailStationNormalized = this.normalizeStationCode(
                detail.stationCode,
              );
              if (detailStationNormalized !== rewardProvinceCodeNormalized) {
                continue;
              }
            }

            const customer = detail.order?.customer;
            const customerSettings =
              (customer?.settings as unknown as BetPairDto[]) || [];
            const regionKey: Region = detail.order.region;
            const dbSettingName = this.getDbSettingName(
              detail.type,
              detail.syntax,
            );

            // Tìm cài đặt giá trúng của khách hàng
            const setting = customerSettings.find(
              (s) => s.name === dbSettingName,
            );

            // Giá trị tiền trúng thưởng cấu hình
            const winValue =
              setting && setting.t && setting.t[regionKey] !== undefined
                ? Number(setting.t[regionKey])
                : 0;

            let soConTrung = 0;
            const cleanTargetNum = (detail.number || "").trim();
            const currentType = (detail.type || "").toLowerCase().trim();

            // -----------------------------------------------------
            // 🟢 A. BAO 2 CÀNG (b2)
            // -----------------------------------------------------
            if (dbSettingName === "b2") {
              const target = cleanTargetNum.padStart(2, "0");
              soConTrung = allRewardNumbers.filter((numStr) => {
                if (!numStr || numStr.length < 2) return false;
                return numStr.slice(-2) === target;
              }).length;
            }

            // -----------------------------------------------------
            // 🔵 B. BAO 3 CÀNG (b3)
            // -----------------------------------------------------
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

            // -----------------------------------------------------
            // 🟣 C. BAO 4 CÀNG (b4)
            // -----------------------------------------------------
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

            // -----------------------------------------------------
            // 🔴 D. 2 CÀNG ĐẦU ĐUÔI (dd2)
            // -----------------------------------------------------
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

            // -----------------------------------------------------
            // 🟤 E. 3 CÀNG ĐẦU ĐUÔI / XỈU CHỦ (dd3 / xc)
            // -----------------------------------------------------
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

            // -----------------------------------------------------
            // 🟠 F. ĐÁ (da)
            // -----------------------------------------------------
            else if (dbSettingName === "da") {
              const targetNumbers = (detail.number || "")
                .split(/[-,\s]+/)
                .map((n) => n.trim().padStart(2, "0"))
                .filter((n) => n.length === 2);

              if (targetNumbers.length >= 2) {
                const allTail2Numbers = allRewardNumbers
                  .filter((numStr) => numStr && numStr.length >= 2)
                  .map((numStr) => numStr.slice(-2));

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

            // -----------------------------------------------------
            // ⚫ G. ĐÁ XIÊN (dax)
            // -----------------------------------------------------
            else if (dbSettingName === "dax") {
              const allTail2Numbers = allRewardNumbers
                .filter((numStr) => numStr && numStr.length >= 2)
                .map((numStr) => numStr.slice(-2));

              const targetNumbers = (detail.number || "")
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

            // =====================================================
            // 3. TÍNH TỔNG TIỀN TRÚNG
            // =====================================================
            let totalWinMoney = 0;

            if (soConTrung > 0) {
              const xacValue = detail.xac ? Number(detail.xac) : 1;

              // Riêng `da`: Khớp với enum DaType (KY_RUOI, NHIEU_CAP, MOT_LAN)
              if (dbSettingName === "da") {
                const datConfig = customer?.dat;

                if (datConfig === "KY_RUOI") {
                  totalWinMoney = winValue * xacValue * 1.5;
                } else if (datConfig === "NHIEU_CAP") {
                  totalWinMoney = soConTrung * winValue * xacValue;
                } else {
                  totalWinMoney = winValue * xacValue;
                }
              }
              // Các hình thức dax
              else if (dbSettingName === "dax") {
                const daxtConfig = customer?.daxt;
                let multiplier = 1;
                if (daxtConfig === "KY_RUOI") {
                  multiplier = soConTrung === 1 ? 1.5 : 1;
                } else if (daxtConfig === "NHIEU_CAP") {
                  multiplier = soConTrung;
                } else {
                  multiplier = 1;
                }
                totalWinMoney = soConTrung * winValue * xacValue * multiplier;
              }
              // Các hình thức thông thường khác
              else {
                totalWinMoney = soConTrung * winValue * xacValue;
              }
            }

            await tx.orderDetails.update({
              where: { id: detail.id },
              data: { trung: totalWinMoney },
            });
          }
        }
      });

      return {
        message: "Cập nhật kết quả xổ số và tính tiền trúng thưởng thành công!",
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }

  async findByDate(release: string) {
    try {
      const reward = await this.prisma.reward.findMany({ where: { release } });
      return {
        message: "Lấy danh sách giải thành công",
        reward,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException("Lỗi hệ thống!");
    }
  }
}
