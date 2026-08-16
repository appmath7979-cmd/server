import { Injectable } from "@nestjs/common";
import { CreateStandardDto } from "./dto/create-standard.dto";
import { UpdateStandardDto } from "./dto/update-standard.dto";

@Injectable()
export class StandardService {
  create(createStandardDto: CreateStandardDto) {
    return "This action adds a new standard";
  }

  findAll() {
    return `This action returns all standard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} standard`;
  }

  update(id: number, updateStandardDto: UpdateStandardDto) {
    return `This action updates a #${id} standard`;
  }

  remove(id: number) {
    return `This action removes a #${id} standard`;
  }
}
