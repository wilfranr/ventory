import { IsString, IsOptional, IsBoolean, IsInt } from "class-validator";

/**
 * DTO utilizado para la creación de un elemento de lista.
 */
export class CreateListItemDto {
  /** Identificador del tipo de lista al que pertenece el elemento */
  @IsInt()
  listTypeId: number;

  /** Nombre descriptivo del elemento */
  @IsString()
  name: string;

  /** Descripción opcional del elemento */
  @IsOptional()
  @IsString()
  description?: string;

  /** Indica si el elemento se encuentra activo */
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
