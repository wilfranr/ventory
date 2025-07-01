# Ventory

Ventory es un proyecto **full-stack** que combina un frontend en Angular con un backend en NestJS.

## Estructura

- `ventory-frontend/`: Aplicación Frontend en Angular.
- `ventory-backend/`: Aplicación Backend en NestJS con Prisma y MySQL.
- `docs/`: Documentación adicional del proyecto.

## Uso rápido

1. Instala las dependencias principales:

   ```bash
   npm install
   ```

2. Inicia ambos entornos en modo desarrollo:

   ```bash
   npm run dev
   ```

### Comandos individuales

```bash
cd ventory-frontend && npm start     # Servidor de Angular
cd ventory-backend && npm run start:dev  # Servidor de NestJS
```

Para más detalles revisa la carpeta [`docs/`](./docs).

## Variables de entorno y base de datos

El backend utiliza variables de entorno para configurar la conexión a la base de datos y la firma de JWT:

```bash
# .env (ejemplo)
DATABASE_URL="file:./dev.db"
JWT_SECRET="cambia-esto"
JWT_EXPIRES_IN="1d"
PORT=3001
```

El archivo `DATABASE_URL` define la ruta de la base de datos SQLite usada por Prisma. Puedes ajustarlo a MySQL o a otro proveedor si lo prefieres.

Tras crear el archivo `.env`, ejecuta las migraciones con Prisma:

```bash
cd ventory-backend
npx prisma migrate dev --name init
```

## Scripts útiles

En la carpeta [`scripts/`](./scripts) encontrarás utilidades para el repositorio. Por ejemplo, `limpiar-ramas.sh` elimina ramas git que ya fueron fusionadas a `main`.

```bash
./scripts/limpiar-ramas.sh
```

## Archivos en borrador

El archivo [`Untitled`](./Untitled) se mantiene como espacio para notas futuras. Por ahora está vacío y puede borrarse si no se necesita.
