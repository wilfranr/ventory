/**
 * DTO para solicitar la creación de un token de registro.
 */
import { IsString, IsNotEmpty } from "class-validator";

export class CreateRegistrationTokenDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
