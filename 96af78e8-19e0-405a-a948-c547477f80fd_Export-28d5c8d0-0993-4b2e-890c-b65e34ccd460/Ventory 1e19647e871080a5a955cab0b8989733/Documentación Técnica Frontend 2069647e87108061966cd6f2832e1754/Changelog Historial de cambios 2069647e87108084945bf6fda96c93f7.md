# Changelog / Historial de cambios

Registro de cambios, mejoras y correcciones relevantes en la aplicación Angular (Frontend).

---

## 2025-06-03

- **[Roles/Permisos]** Integrado y validado el flujo de asignación de permisos a roles usando el endpoint `/api/roles/:id/permissions` y el método PATCH.
- **[Refactor]** Ajuste en el método `saveRole()` del componente de roles para enviar correctamente el array de `permissionIds`.
- **[Bugfix]** Solución al error 404 al intentar actualizar permisos de roles: ahora se usa la ruta y estructura de payload correcta.
- **[UX]** Mejoras en el feedback visual tras crear o editar roles/permisos.
- **[Proxy]** Verificada configuración de proxy Angular para consumir la API backend.

---

## 2025-06-02

- **[Security]** Ajustado manejo de tokens JWT: almacenamiento en localStorage tras login exitoso y uso automático en headers mediante interceptor.
- **[Testing]** Pruebas manuales e integración de flujos críticos: login, registro, consulta de usuarios, creación de roles y asignación de permisos.
- **[Docs]** Actualización de la guía de consumo de APIs y componentes principales.

---

## 2025-06-01

- **[Components]** Refactor de componentes standalone para usuarios y roles.
- **[UI]** Mejora en el diseño de formularios (PrimeNG, inputs, validaciones).
- **[Docs]** Inicio de la documentación de estructura de componentes y servicios de frontend.

---

*Para cada cambio o mejora, agrega una línea con la fecha, el área impactada y una breve descripción.*

---

**Nota:**

Mantener actualizado el changelog facilita el seguimiento del proyecto, la revisión en equipo y la trazabilidad de mejoras o regresiones en producción.