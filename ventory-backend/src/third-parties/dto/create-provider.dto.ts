import { IsString, IsOptional } from 'class-validator';
import { CreateThirdPartyDto } from './create-third-party.dto';

export class CreateProviderDto extends CreateThirdPartyDto {
  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsString()
  @IsOptional()
  bankAccount?: string;
}

