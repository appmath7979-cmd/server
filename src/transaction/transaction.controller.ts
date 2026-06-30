import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

@Controller("transaction")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() data: CreateTransactionDto) {
    const res = await this.transactionService.create(data);
    return res;
  }

  @Get()
  async findAll(@Query("customerId") customerId: string) {
    const res = await this.transactionService.findAll(customerId);
    return res;
  }
}
