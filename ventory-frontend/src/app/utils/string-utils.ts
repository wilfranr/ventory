/**
 * Función que se encarga de convertir una cadena de texto a formato Title Case.
 * Convierte a mayúscula solo la primera letra de cada palabra, respetando tildes y caracteres especiales.
 */
export function toTitleCase(str: string): string {
    if (!str) return '';
    
    return str
        .toLowerCase()
        .split(' ')
        .map(word => {
            // Encuentra el primer caracter que sea una letra (incluyendo acentos)
            const firstLetterMatch = word.match(/[a-záéíóúüñ]/i);
            if (!firstLetterMatch) return word;
            
            const firstLetterIndex = firstLetterMatch.index || 0;
            const firstLetter = word[firstLetterIndex];
            const restOfWord = word.slice(firstLetterIndex + 1);
            
            return word.substring(0, firstLetterIndex) + 
                   firstLetter.toUpperCase() + 
                   restOfWord;
        })
        .join(' ');
}
