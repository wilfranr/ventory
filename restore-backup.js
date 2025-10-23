// Script para restaurar la base de datos desde un respaldo
const { restoreBackup } = require('./ventory-backend/scripts/backup-db');
const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Por favor, especifica la ruta al archivo de respaldo que deseas restaurar.');
    console.log('Uso: node restore-backup.js <ruta-al-archivo-de-respaldo>');
    process.exit(1);
  }

  const backupFile = path.resolve(args[0]);
  
  if (!fs.existsSync(backupFile)) {
    console.error(`El archivo de respaldo no existe: ${backupFile}`);
    process.exit(1);
  }

  console.log(`Iniciando restauración desde: ${backupFile}`);
  
  try {
    await restoreBackup(backupFile);
    console.log('¡Restauración completada con éxito!');
    console.log('Reinicia el servidor para aplicar los cambios.');
  } catch (error) {
    console.error('Error durante la restauración:', error);
    process.exit(1);
  }
}

main().catch(console.error);
