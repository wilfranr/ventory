# Módulo de Company

## Objetivo

Gestionar los parámetros generales de cada empresa, tales como la moneda de operaciones y el porcentaje de IVA.

## Backend

- **Ruta** `PUT /companies/:id/settings` para actualizar los ajustes de la empresa.
- **DTO** `UpdateCompanySettingsDto` con campos `currency` y `vatPercent`.
- **Servicio** `CompanyService.updateGeneralParams` encargado de persistir los cambios.

## Frontend

- Página `CompanySettingsComponent` accesible desde `/company-settings`.
- Usa `CompanyService` para obtener y actualizar los parámetros.
- Solo los usuarios con rol `admin` o `superadmin` pueden editar la información.
