import { PartialType } from '@nestjs/swagger';
import { CreateListTypeDto } from './create-list-type.dto';

export class UpdateListTypeDto extends PartialType(CreateListTypeDto) {}
