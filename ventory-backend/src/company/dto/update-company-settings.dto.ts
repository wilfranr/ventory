import { IsOptional, IsString, IsNumber, Min, Max } from "class-validator";

export class UpdateCompanySettingsDto {
  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  vatPercent?: number;
}
