# Changelog / Historial de cambios

Registro de los principales cambios técnicos, mejoras y correcciones en el backend y frontend.

---

## 2025-06-03

- **[Security]** Implementación de guards globales (`JwtAuthGuard` y `PermissionsGuard`) usando el provider `APP_GUARD` en el módulo principal.
- **[Security]** Creación e integración del decorador `@Public()` para excluir rutas públicas (login, registro) de la protección global de guards.
- **[Roles & Permissions]** Actualización del flujo de asignación de permisos: ahora los permisos de cada rol se asignan mediante el endpoint `PATCH /api/roles/:id/permissions` y el payload `permissionIds`.
- **[Frontend]** Ajuste en el método `saveRole()` para utilizar la ruta y el payload correcto al asignar permisos a un rol desde Angular.
- **[Backend]** Validación y documentación de rutas protegidas y públicas.
- **[Docs]** Actualización de la sección "Rutas protegidas por permisos" y de la descripción de servicios en la documentación técnica.
- **[General]** Refuerzo en las guías de buenas prácticas: uso estricto de DTOs, manejo global de excepciones, y convención para documentación de endpoints.

---

## 2025-06-02

- **[Bugfix]** Corrección de error 401 en login: se detectó que los guards globales bloqueaban el endpoint público, solucionado con el decorador `@Public()`.
- **[Testing]** Pruebas exitosas del flujo de autenticación desde Postman y frontend.
- **[Security]** Confirmación de validación y almacenamiento seguro del token JWT en frontend tras login exitoso.
- **[Infra]** Verificación de configuración de proxy para Angular y habilitación de CORS en backend (si aplica).

---

## 2025-06-01

- **[Refactor]** Mejora en la gestión de roles y permisos: creación de endpoints separados para asignación y consulta.
- **[Docs]** Inicio del refuerzo documental de endpoints, servicios y guías de buenas prácticas.

---

*Para cambios menores, refactors internos o issues específicos, agregar una breve línea indicando la fecha, módulo y descripción.*

---

**Nota:**

Mantener este changelog actualizado ayuda al equipo a comprender la evolución del sistema, facilita el onboarding y mejora la trazabilidad en despliegues y revisiones técnicas.