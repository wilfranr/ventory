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

- `PUT /companies/:id/settings` permite modificar nombre, NIT, email, dirección,
  teléfonos, sitio web, moneda, porcentaje de IVA y logo.
- Ahora acepta `multipart/form-data` para la carga del logo.
- Utiliza el DTO `UpdateCompanySettingsDto` con todas esas propiedades.
