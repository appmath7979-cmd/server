import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Controller("customer")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  async findAllCustomer(@Body() userId: string) {
    return await this.customerService.getAllCustomer(userId);
  }

  @Get(":id")
  async findCustomerById(@Param("id") id: string) {
    return await this.customerService.getCustomerById(id);
  }

  @Get("get-setting")
  async getCustomerSetting(@Body() id: string) {
    return await this.customerService.getCustomerSetting(id);
  }

  @Post()
  async createCustomer(@Body() data: CreateCustomerDto) {
    return await this.customerService.create(data);
  }

  @Delete("many")
  async deleteManyCustomer(@Body() ids: string[]) {
    return await this.customerService.deleteManyCustomer(ids);
  }

  @Delete(":id")
  async deleteCustomerById(@Param("id") id: string) {
    return await this.customerService.deleteCustomerById(id);
  }
}
