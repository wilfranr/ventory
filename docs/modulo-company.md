# Módulo de Company

## Objetivo

Gestionar los parámetros generales de cada empresa.

## Backend

- **Ruta** `PUT /companies/:id/settings` para actualizar los ajustes de la empresa.
- **DTO** `UpdateCompanySettingsDto` con campos `name`, `nit`, `email`, `address`, `phones`, `website`, `currency`, `vatPercent` y `logo`.
  - El campo `logo` ahora soporta la carga de archivos (multipart/form-data).
- **Servicio** `CompanyService.updateGeneralParams` encargado de persistir los cambios, incluyendo la gestión del archivo del logo.

## Frontend

- Página `CompanySettingsComponent` accesible desde `/company-settings`.
- Usa `CompanyService` para obtener y actualizar los parámetros.
- Solo los usuarios con rol `admin` o `superadmin` pueden editar la información.
