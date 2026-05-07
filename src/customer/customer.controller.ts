import { Body, Controller, Get, Post } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Controller("customer")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAll() {
    return await this.customerService.findCustomers();
  }

  @Post()
  async create(@Body() data: CreateCustomerDto) {
    return this.customerService.createCustomer(data);
  }
}
