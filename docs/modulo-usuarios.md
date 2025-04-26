# Módulo de Gestión de Usuarios y Roles

## Objetivo

Implementar un sistema de gestión de usuarios que permita controlar el acceso a las diferentes funcionalidades de la plataforma Ventory mediante la asignación de roles y permisos.

## Entidades Principales

- **Usuarios (`users`)**
  - Representan a las personas que utilizan la plataforma.
- **Roles (`roles`)**
  - Agrupan conjuntos de permisos comunes.
- **Permisos (`permissions`)**

  - Definen acciones específicas que se pueden realizar en el sistema.

- **Tablas intermedias**
  - `user_roles`: Relaciona usuarios con roles (Many-to-Many).
  - `role_permissions`: Relaciona roles con permisos (Many-to-Many).

---

## Modelo de Base de Datos

### Tabla: `users`

| Campo      | Tipo      | Descripción            |
| :--------- | :-------- | :--------------------- |
| id         | int (PK)  | Identificador único    |
| name       | string    | Nombre del usuario     |
| email      | string    | Correo electrónico     |
| password   | string    | Contraseña encriptada  |
| created_at | timestamp | Fecha de creación      |
| updated_at | timestamp | Fecha de actualización |

### Tabla: `roles`

| Campo       | Tipo     | Descripción         |
| :---------- | :------- | :------------------ |
| id          | int (PK) | Identificador único |
| name        | string   | Nombre del rol      |
| description | string   | Descripción del rol |

### Tabla: `permissions`

| Campo       | Tipo     | Descripción             |
| :---------- | :------- | :---------------------- |
| id          | int (PK) | Identificador único     |
| name        | string   | Nombre del permiso      |
| description | string   | Descripción del permiso |

### Tabla: `user_roles`

| Campo   | Tipo     | Descripción             |
| :------ | :------- | :---------------------- |
| id      | int (PK) | Identificador único     |
| user_id | int (FK) | Referencia a `users.id` |
| role_id | int (FK) | Referencia a `roles.id` |

### Tabla: `role_permissions`

| Campo         | Tipo     | Descripción                   |
| :------------ | :------- | :---------------------------- |
| id            | int (PK) | Identificador único           |
| role_id       | int (FK) | Referencia a `roles.id`       |
| permission_id | int (FK) | Referencia a `permissions.id` |

---

## Diagrama Entidad-Relación

users ───< user_roles >─── roles ───< role_permissions >─── permissions

---

## Flujos de Procesos

### 1. Creación de un Permiso

- Definir nombre y descripción del permiso.
- Guardar en tabla `permissions`.

### 2. Creación de un Rol

- Definir nombre y descripción del rol.
- Asignar uno o varios permisos al rol.
- Guardar en tabla `roles` y tabla `role_permissions`.

### 3. Creación de un Usuario

- Registrar usuario con nombre, email y contraseña.
- Asignar uno o varios roles al usuario.
- Guardar en tabla `users` y tabla `user_roles`.

---

## Autenticación y Autorización

- **Autenticación**: Se realiza mediante JWT Tokens.
- **Autorización**:
  - Validar si el usuario tiene el rol requerido.
  - Validar si el rol del usuario contiene los permisos necesarios.
- **Guards de NestJS**:
  - `RolesGuard`: Protege rutas basadas en roles.
  - `PermissionsGuard`: Protege rutas basadas en permisos.

---

## Consideraciones Especiales

- El primer usuario creado debe ser de tipo `superadmin`.
- Los cambios en roles o permisos deben pasar por validaciones antes de impactar en producción.
- El sistema debe permitir asignar múltiples roles a un mismo usuario (opcional para futuro).

---

## Pendientes por Documentar

- Ejemplo de uso de Guards (`@Roles()`, `@Permissions()`) en controladores de NestJS.
- Política de actualizaciones de roles y permisos.
- Diagramas de flujo detallados para procesos de creación y edición.

---

## Anexos

- [Diagrama de flujo de creación de usuario](./flujo-creacion-usuario.png)
- [Modelo Entidad-Relación](./modelo-er.png)
