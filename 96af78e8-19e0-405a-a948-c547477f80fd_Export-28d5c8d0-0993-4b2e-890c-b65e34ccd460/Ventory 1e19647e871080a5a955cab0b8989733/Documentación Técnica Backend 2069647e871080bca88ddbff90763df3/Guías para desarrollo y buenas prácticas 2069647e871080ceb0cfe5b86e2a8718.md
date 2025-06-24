# Guías para desarrollo y buenas prácticas

## Guías para desarrollo y buenas prácticas

## Estructura y organización

- Sigue la estructura de carpetas definida por el equipo para módulos, controladores, servicios, DTOs, entidades y pruebas.
- Crea un **servicio** (`Service`) por cada dominio principal del sistema (usuarios, roles, pedidos, etc.), manteniendo la lógica de negocio aislada.
- Mantén controladores ligeros: solo reciben la petición, validan y delegan la lógica en los servicios.

## Validación y DTOs

- Usa **DTOs** (`Data Transfer Objects`) en todos los endpoints para validar y tipar los datos de entrada.
- Utiliza decoradores de validación como `@IsString()`, `@IsEmail()`, etc., para mejorar la calidad de los datos y la seguridad.

## Manejo de errores

- Implementa **filtros globales de excepción** para capturar y formatear errores en toda la aplicación.
- Utiliza excepciones específicas de NestJS (`BadRequestException`, `UnauthorizedException`, etc.) para cada tipo de error esperado.

## Seguridad y protección de endpoints

- Protege endpoints sensibles con **guards globales** (`JwtAuthGuard`, `PermissionsGuard`) usando `APP_GUARD` en el módulo raíz.
- Marca los endpoints públicos (por ejemplo, `/auth/login` y `/auth/register`) con el decorador `@Public()` para excluirlos de la protección automática.
- Controla el acceso granular usando decoradores de permisos personalizados (`@Permissions('permiso')`).

## Pruebas

- Realiza **pruebas unitarias** para la lógica de cada servicio.
- Desarrolla **pruebas de integración** para flujos completos entre módulos (por ejemplo, registro, login, asignación de permisos).
- Usa mocks y pruebas automatizadas para asegurar la calidad del código.

## Documentación y cambios

- Documenta **cualquier cambio importante** o nuevo flujo en esta sección, manteniendo la documentación técnica siempre actualizada.
- Actualiza los listados de endpoints, servicios y estructuras de datos tras cada refactor o ampliación relevante.

---

**Recuerda:**

La claridad en la organización y documentación facilita el mantenimiento, la colaboración y la escalabilidad del proyecto.