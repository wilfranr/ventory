/**
 * DTO para creación de roles.
 */
import { IsString, IsNotEmpty, IsArray, IsInt } from "class-validator";

export class createRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsArray()
  @IsInt({ each: true })
  perrmissions: number[]; // Array de perrmissions
}
