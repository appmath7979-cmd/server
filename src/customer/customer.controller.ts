import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Controller("customer")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Body() data: CreateCustomerDto) {
    return await this.customerService.createCustomer(data);
  }

  @Get()
  async getMany(@Query() query: { order?: boolean; release?: string }) {
    return await this.customerService.getAllCustomer(query);
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return await this.customerService.getCustomerById(id);
  }
}
