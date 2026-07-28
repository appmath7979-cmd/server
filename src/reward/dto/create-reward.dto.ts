import { Region } from "@prisma/client";
import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  provinceCode: string;

  @IsString()
  @IsNotEmpty()
  release: string;

  @IsEnum(Region)
  region: Region;

  @IsArray()
  @IsString({ each: true })
  gdb: string[];

  @IsArray()
  @IsString({ each: true })
  g1: string[];

  @IsArray()
  @IsString({ each: true })
  g2: string[];

  @IsArray()
  @IsString({ each: true })
  g3: string[];

  @IsArray()
  @IsString({ each: true })
  g4: string[];

  @IsArray()
  @IsString({ each: true })
  g5: string[];

  @IsArray()
  @IsString({ each: true })
  g6: string[];

  @IsArray()
  @IsString({ each: true })
  g7: string[];

  @IsArray()
  @IsString({ each: true })
  g8: string[];
}
