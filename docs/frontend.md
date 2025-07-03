# Frontend

Guía básica para la aplicación Angular.

```bash
cd ventory-frontend
npm install
```

Para arrancar el servidor de desarrollo:

```bash
ng serve
```

Construye la aplicación con:

```bash
ng build
```

## Company Settings

La pantalla `CompanySettingsComponent` permite modificar la moneda, el IVA y el logo de la empresa.

- Se accede mediante la ruta `/company-settings`.
- Se ha implementado la carga de logos con previsualización utilizando `p-fileupload` de PrimeNG.
- Solo administradores pueden editar los valores.
