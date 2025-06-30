/**
 * DTO para la creación de tipos de lista.
 */
import { IsString, IsOptional } from "class-validator";

export class CreateListTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
