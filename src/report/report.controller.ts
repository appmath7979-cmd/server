import { Controller, Get, Query } from "@nestjs/common";
import { ReportService } from "./report.service";

@Controller("report")
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  async getAll(
    @Query("release") release?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return await this.reportService.findAll({ release, startDate, endDate });
  }
}
