import { PartialType } from "@nestjs/swagger";
import { CreateListItemDto } from "./create-list-item.dto";

/**
 * DTO utilizado para actualizar parcial o totalmente un elemento de lista.
 */
export class UpdateListItemDto extends PartialType(CreateListItemDto) {}
