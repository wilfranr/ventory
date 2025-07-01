/**
 * Función que se encarga de convertir una cadena de texto a formato Title Case porque no falta el que ponga todo en mayúsculas.
 */
export function toTitleCase(str: string): string {
    return str
        .toLowerCase() // <- Pone todo en minúsculas primero
        .replace(/\b\w/g, (char) => char.toUpperCase());
}
