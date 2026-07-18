import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getManyByDate(@Query() query: { release: string }) {
    return await this.orderService.getAllOrderByDate(query.release);
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return await this.orderService.getById(id);
  }

  @Post()
  async create(@Body() data: CreateOrderDto) {
    return await this.orderService.createOrder(data);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() data: UpdateOrderDto) {
    return await this.orderService.editOrder(id, data);
  }

  @Delete(":id")
  async deleteById(@Param("id") id: string) {
    return await this.orderService.deleteById(id);
  }
}
