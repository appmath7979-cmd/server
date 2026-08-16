import { PartialType } from "@nestjs/swagger";
import { CreateStandardPersonalDto } from "./create-standard-personal.dto";

export class UpdateStandardPersonalDto extends PartialType(
  CreateStandardPersonalDto,
) {}
