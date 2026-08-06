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

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getByCustomerId(
    @Query() query: { customerId: string; release: string },
  ) {
    return await this.orderService.getByCustomerId(query);
  }

  @Post()
  async createOrder(@Body() data: CreateOrderDto) {
    return await this.orderService.createOrder(data);
  }

  @Post("/layoff")
  async createLayoff(@Body() data: CreateOrderDto) {
    return await this.orderService.createLayoff(data);
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
