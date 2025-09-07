import { IsOptional, IsString, IsIn } from "class-validator";

export class UpdateCompanyThemeDto {
  @IsOptional()
  @IsString()
  @IsIn(['Aura', 'Lara', 'Nora'])
  themePreset?: string;

  @IsOptional()
  @IsString()
  themePrimary?: string;

  @IsOptional()
  @IsString()
  themeSurface?: string;

  @IsOptional()
  @IsString()
  @IsIn(['static', 'overlay'])
  menuMode?: string;
}
