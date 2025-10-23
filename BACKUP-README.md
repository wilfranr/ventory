# Sistema de Respaldo de Base de Datos

Este directorio contiene los scripts y la configuración necesaria para el sistema de respaldo automático de la base de datos de Ventry.

## Descripción

El sistema de respaldo realiza copias de seguridad periódicas de la base de datos SQLite y las almacena en el directorio `backups/`. Además, mantiene un registro de todos los respaldos realizados en la tabla `BackupLog` de la base de datos.

## Características

- **Respaldo automático diario** a la 1:00 AM
- **Retención de 7 días** de respaldos
- **Registro detallado** de cada operación de respaldo
- **Herramienta de restauración** para recuperar la base de datos desde un respaldo

## Uso

### Iniciar el servicio de respaldo

```bash
npm run backup:start
```

Este comando inicia el servicio de respaldo en segundo plano.

### Crear un respaldo manual

```bash
npm run backup:create
```

### Listar respaldos disponibles

```bash
npm run backup:list
```

### Restaurar desde un respaldo

```bash
npm run backup:restore /ruta/completa/al/respaldo/backup-2023-10-02T18-30-00-000Z.db
```

## Estructura de archivos

- `backups/`: Directorio que contiene los archivos de respaldo
- `scripts/backup-db.js`: Lógica principal del sistema de respaldo
- `start-backup-service.js`: Script para iniciar el servicio de respaldo
- `restore-backup.js`: Herramienta para restaurar la base de datos

## Configuración

La configuración del sistema de respaldo se encuentra en `scripts/backup-db.js`. Los parámetros más importantes son:

- `BACKUP_DIR`: Directorio donde se guardan los respaldos
- `DB_PATH`: Ruta a la base de datos SQLite
- `MAX_BACKUPS`: Número máximo de respaldos a conservar
- `BACKUP_INTERVAL`: Frecuencia de respaldo en milisegundos

## Monitoreo

Puedes consultar el estado de los respaldos en la tabla `BackupLog` de la base de datos:

```sql
SELECT * FROM BackupLog ORDER BY createdAt DESC;
```

## Solución de problemas

### No se crean respaldos

1. Verifica que el directorio de respaldos tenga permisos de escritura
2. Revisa los logs del sistema en busca de errores
3. Asegúrate de que el servicio de respaldo esté en ejecución

### Error al restaurar un respaldo

1. Verifica que el archivo de respaldo exista y sea accesible
2. Asegúrate de que la aplicación no esté en uso durante la restauración
3. Comprueba que haya suficiente espacio en disco

## Notas importantes

- Los respaldos contienen información sensible. Asegúrate de proteger el acceso al directorio de respaldos.
- Se recomienda configurar copias de seguridad externas del directorio de respaldos.
- Antes de realizar cambios importantes en la base de datos, crea un respaldo manual.
