/**
 * Representa un elemento de una lista de valores.
 * Se utiliza para almacenar pares clave/valor
 * asociados a un tipo de lista determinado.
 */
export interface ListItem {
    /** Identificador único del ítem */
    id: number;
    /** Identificador del tipo de lista al que pertenece */
    listTypeId: string;
    /** Nombre visible del ítem */
    name: string;
    /** Descripción opcional */
    description?: string;
    /** Indica si el ítem está activo */
    active: boolean;
    /** Fecha de creación */
    createdAt?: string;
    /** Fecha de actualización */
    updatedAt?: string;
    /** Relación con el tipo de lista */
    listType?: {
        id: number;
        name: string;
        code: string;
        description?: string;
    };
}
