import { IsNumber, IsOptional } from 'class-validator';
import { CreateThirdPartyDto } from './create-third-party.dto';

export class CreateClientDto extends CreateThirdPartyDto {
  @IsNumber()
  @IsOptional()
  creditLimit?: number;
}

