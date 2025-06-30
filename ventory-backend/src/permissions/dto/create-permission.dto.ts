/**
 * DTO para crear nuevos permisos.
 */
import { IsString, IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;
}
