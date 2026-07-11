import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() data: CreateOrderDto) {
    return await this.orderService.createOrder(data);
  }

  @Get()
  async getManyByDate(@Query() query: { dateRelease: string }) {
    return await this.orderService.getAllOrderByDate(query.dateRelease);
  }
}
