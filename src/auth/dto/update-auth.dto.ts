import { PartialType } from "@nestjs/mapped-types";
import { CreateAuthDto } from "./sign-up.dto";

export class UpdateAuthDto extends PartialType(CreateAuthDto) {}
