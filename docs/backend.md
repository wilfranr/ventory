# Backend

Instrucciones para trabajar con el servidor NestJS.

```bash
cd ventory-backend
npm install
```

Para iniciar en modo desarrollo:

```bash
npm run start:dev
```

Puedes ejecutar las pruebas con:

```bash
npm run test
```

## Módulo Company

Gestión de los parámetros generales de la empresa.

- `PUT /companies/:id/settings` actualiza moneda y porcentaje de IVA.
- Utiliza el DTO `UpdateCompanySettingsDto`.
