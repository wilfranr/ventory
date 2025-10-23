import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsDateString()
  @IsOptional()
  installDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  thirdPartyId: string;

  @IsString()
  @IsNotEmpty()
  assetTypeId: string;

  @IsString()
  @IsNotEmpty()
  statusId: string;
}
