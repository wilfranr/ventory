import { IsString, IsOptional, IsBoolean, IsInt } from "class-validator";

export class CreateListItemDto {
  @IsInt()
  listTypeId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
