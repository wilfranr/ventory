const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuración
const BACKUP_DIR = path.join(__dirname, '../../backups');
const DB_PATH = path.join(__dirname, '../prisma/dev.db');
const MAX_BACKUPS = 7; // Mantener copias de los últimos 7 días
const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas

// Asegurar que el directorio de respaldos exista
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Función para crear un respaldo
async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.db`);
  
  try {
    // Usar el comando sqlite3 para crear una copia de la base de datos
    await new Promise((resolve, reject) => {
      const command = `sqlite3 ${DB_PATH} ".backup '${backupFile}'"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al crear el respaldo: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`Error en el comando: ${stderr}`);
          return reject(new Error(stderr));
        }
        console.log(`Respaldo creado: ${backupFile}`);
        resolve(stdout);
      });
    });

    // Limpiar respaldos antiguos
    await cleanOldBackups();
    
    // Registrar el respaldo en la base de datos
    await prisma.backupLog.create({
      data: {
        fileName: path.basename(backupFile),
        filePath: backupFile,
        status: 'COMPLETED',
        size: fs.statSync(backupFile).size
      }
    });
    
  } catch (error) {
    console.error('Error en el proceso de respaldo:', error);
    
    // Registrar el error en la base de datos
    try {
      await prisma.backupLog.create({
        data: {
          fileName: path.basename(backupFile),
          filePath: backupFile,
          status: 'FAILED',
          error: error.message
        }
      });
    } catch (dbError) {
      console.error('No se pudo registrar el error en la base de datos:', dbError);
    }
  }
}

// Función para limpiar respaldos antiguos
async function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Mantener solo los últimos MAX_BACKUPS archivos
    const toDelete = files.slice(MAX_BACKUPS);
    
    for (const file of toDelete) {
      const filePath = path.join(BACKUP_DIR, file.name);
      fs.unlinkSync(filePath);
      console.log(`Respaldo eliminado: ${filePath}`);
    }
  } catch (error) {
    console.error('Error al limpiar respaldos antiguos:', error);
  }
}

// Función para restaurar desde un respaldo
async function restoreBackup(backupFile) {
  if (!fs.existsSync(backupFile)) {
    throw new Error(`El archivo de respaldo no existe: ${backupFile}`);
  }

  try {
    // Detener cualquier conexión activa a la base de datos
    await prisma.$disconnect();
    
    // Hacer una copia de seguridad de la base de datos actual antes de restaurar
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreBackup = path.join(BACKUP_DIR, `pre-restore-${timestamp}.db`);
    fs.copyFileSync(DB_PATH, preRestoreBackup);
    
    // Restaurar la base de datos
    await new Promise((resolve, reject) => {
      const command = `sqlite3 ${DB_PATH} ".restore '${backupFile}'"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al restaurar el respaldo: ${error.message}`);
          return reject(error);
        }
        if (stderr) {
          console.error(`Error en el comando: ${stderr}`);
          return reject(new Error(stderr));
        }
        console.log(`Base de datos restaurada desde: ${backupFile}`);
        resolve(stdout);
      });
    });
    
    // Volver a conectar Prisma
    await prisma.$connect();
    
    return true;
  } catch (error) {
    console.error('Error al restaurar la base de datos:', error);
    throw error;
  }
}

// Iniciar el programa de respaldo
async function startBackupService() {
  console.log('Iniciando servicio de respaldo de base de datos...');
  
  // Crear un respaldo inmediatamente al iniciar
  await createBackup();
  
  // Programar respaldos periódicos
  setInterval(createBackup, BACKUP_INTERVAL);
  
  console.log(`Servicio de respaldo en ejecución. Próximo respaldo en ${BACKUP_INTERVAL/1000/60/60} horas.`);
}

// Si se ejecuta directamente, iniciar el servicio
if (require.main === module) {
  startBackupService().catch(console.error);
}

module.exports = {
  createBackup,
  restoreBackup,
  cleanOldBackups,
  startBackupService
};
