/**
 * Define la estructura de un tipo de lista.
 * Un tipo de lista agrupa a múltiples elementos
 * (ListItem) con un mismo significado.
 */
export interface ListType {
    /** Identificador único del tipo */
    id: number;
    /** Código interno opcional */
    code?: string;
    /** Nombre del tipo de lista */
    name: string;
    /** Descripción opcional del tipo */
    description?: string;
    /** Fecha de creación */
    createdAt?: string;
    /** Fecha de última actualización */
    updatedAt?: string;
}
