// Script para iniciar el servicio de respaldo
const { startBackupService } = require('./ventory-backend/scripts/backup-db');
const cron = require('node-cron');

console.log('Iniciando servicio de respaldo de base de datos...');

// Iniciar el servicio de respaldo
startBackupService().catch(console.error);

// Programar respaldo diario a la 1 AM
cron.schedule('0 1 * * *', () => {
  console.log('Ejecutando respaldo programado...');
  require('./ventory-backend/scripts/backup-db').createBackup()
    .catch(console.error);
});

console.log('Servicio de respaldo configurado. Los respaldos se ejecutarán diariamente a la 1 AM.');
