import { Body, Controller, Get, Post, Put, Query } from "@nestjs/common";
import { SettingService } from "./setting.service";
import { CreateSettingDto } from "./dto/create-setting.dto";
import { UpdateSettingDto } from "./dto/update-setting.dto";

@Controller("setting")
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  async getByDay(@Query("day") day: number) {
    return await this.settingService.getByDay(day);
  }

  @Post()
  async createMany(@Body() data: CreateSettingDto[]) {
    return await this.settingService.createMany(data);
  }

  @Put()
  async updateMany(@Body() data: UpdateSettingDto[]) {
    return await this.settingService.updateMany(data);
  }
}
