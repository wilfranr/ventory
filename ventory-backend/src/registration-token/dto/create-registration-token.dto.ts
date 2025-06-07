import { IsString, IsNotEmpty } from "class-validator";

export class CreateRegistrationTokenDto {
  @IsString()
  @IsNotEmpty()
  role: string;
}
