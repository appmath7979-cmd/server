import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { GetOrderDto } from "./dto/get-order.dto";
import { Region } from "@prisma/client";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() data: CreateOrderDto) {
    return await this.orderService.createOrder(data);
  }

  @Post("/layoff")
  async createLayoff(@Body() data: CreateOrderDto) {
    return await this.orderService.createLayoff(data);
  }

  @Get()
  async getAllByDate(@Query() queries: GetOrderDto) {
    const { region, isLayoff, isSend, release } = queries;
    return await this.orderService.findAll({
      region,
      release,
      isLayoff,
      isSend,
    });
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return await this.orderService.findById(id);
  }

  @Get("customer/:customerId")
  async getByDateWithCustomerId(
    @Param("customerId") customerId: string,
    @Query("release") release: string,
    @Query("region") region: Region,
  ) {
    return await this.orderService.findByDateWithCustomerId({
      customerId,
      release,
      region,
    });
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string) {
    return await this.orderService.deleteById(id);
  }

  @Delete()
  async deleteMany(@Body() ids: string[]) {
    return await this.orderService.deleteMany(ids);
  }
}
