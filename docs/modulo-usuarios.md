# Módulo de Gestión de Usuarios y Roles

## Objetivo

Implementar un sistema de gestión de usuarios que permita controlar el acceso a las diferentes funcionalidades de la plataforma Ventory mediante la asignación de roles y permisos.

## Entidades Principales

- **Usuarios (`users`)**  
  Representan a las personas que utilizan la plataforma.

- **Roles (`roles`)**  
  Agrupan conjuntos de permisos comunes.

- **Permisos (`permissions`)**  
  Definen acciones específicas que se pueden realizar en el sistema.

- **Tablas intermedias**
  - `user_roles`: Relaciona usuarios con roles (Many-to-Many).  
    _(Nota: actualmente solo se asigna un rol por usuario, pero se deja abierta la posibilidad de extenderlo a múltiples roles en el futuro)._
  - `role_permissions`: Relaciona roles con permisos (Many-to-Many).

## Modelo de Base de Datos

### Tabla: `users`

| Campo      | Tipo        | Descripción                |
| ---------- | ----------- | -------------------------- |
| id         | int (PK)    | Identificador único        |
| name       | string      | Nombre del usuario         |
| email      | string      | Correo electrónico         |
| password   | string      | Contraseña encriptada      |
| role_id    | string (FK) | Referencia al rol asignado |
| company_id | string (FK) | Empresa asociada           |
| created_at | timestamp   | Fecha de creación          |
| updated_at | timestamp   | Fecha de actualización     |

### Tabla: `roles`

| Campo      | Tipo        | Descripción                                 |
| ---------- | ----------- | ------------------------------------------- |
| id         | string (PK) | Identificador único                         |
| name       | enum        | Nombre del rol (`admin`, `logistica`, etc.) |
| created_at | timestamp   | Fecha de creación                           |
| updated_at | timestamp   | Fecha de actualización                      |

### Tabla: `permissions`

| Campo      | Tipo        | Descripción                             |
| ---------- | ----------- | --------------------------------------- |
| id         | string (PK) | Identificador único                     |
| name       | string      | Nombre del permiso (ej. `ver_usuarios`) |
| created_at | timestamp   | Fecha de creación                       |
| updated_at | timestamp   | Fecha de actualización                  |

### Tabla: `role_permissions`

| Campo         | Tipo   | Descripción                   |
| ------------- | ------ | ----------------------------- |
| role_id       | string | Referencia a `roles.id`       |
| permission_id | string | Referencia a `permissions.id` |

## Diagrama Entidad-Relación

```
users ────┬──► roles ────┬──► permissions
          │              │
          │              └─ Tabla intermedia: role_permissions
          └─ Relación actual: user tiene un solo rol (pero extensible)
```

## Flujos de Procesos

### 1. Creación de un Permiso

- Se recibe nombre del permiso.
- Se guarda en la tabla `permissions`.

### 2. Creación de un Rol

- Se define un nombre (`admin`, `logistica`, etc.).
- Se asocian uno o más permisos.
- Se registra en `roles` y `role_permissions`.

### 3. Registro de un Usuario

- Se registra el usuario vía formulario o token.
- Se asigna un rol al usuario.
- Se registra en `users` (vía `role_id`).

## Autenticación y Autorización

- **Autenticación**:  
  Mediante JWT emitido en el login (`/auth/login`), donde el `sub` del token contiene el `user.id`.

- **Autorización**:
  - Se evalúa el `role` del usuario.
  - Se validan los `permissions` del rol.
  - Se puede proteger cada ruta con decoradores personalizados.

### ✅ Guards de NestJS

- `PermissionsGuard`: Evalúa los permisos del rol asociado al usuario autenticado.
- `JwtAuthGuard`: Protege rutas por token.
- Decorador `@Permissions(...)`: Se usa así:

```ts
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('ver_usuarios')
@Get()
findAll() {
  return this.usersService.getAll();
}
```

## Consideraciones Especiales

- El primer usuario creado se define como `superadmin`.
- Los cambios en roles y permisos deben pasar por validación previa (especialmente en producción).
- Aunque el modelo admite múltiples roles, actualmente se usa un solo rol por usuario para simplificar la lógica de autorización.

## Ejemplos de Uso de Guards

```ts
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('crear_usuario')
@Post()
createUser(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);
}
```

## Política de Actualización

- Cada cambio en los permisos debe documentarse y reflejarse en el sistema de seeds.
- Los roles se pueden editar desde el panel de administración por usuarios con permisos elevados (`admin`, `superadmin`).

# 📄 Documentación de Permisos por Módulo – Ventory

| 🧩 Módulo              | 🔐 Permisos Asociados                                                                       | 🗒️ Descripción Breve                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Usuarios**           | `crear_usuario`<br>`ver_usuarios`<br>`editar_usuario`<br>`eliminar_usuario`                 | Permisos para crear, ver, editar o eliminar usuarios.                     |
| **Roles**              | `crear_rol`<br>`ver_roles`<br>`asignar_rol`                                                 | Gestión de roles y asignación a usuarios.                                 |
| **Pedidos**            | `crear_pedido`<br>`ver_pedidos`<br>`editar_pedido`<br>`aprobar_pedido`<br>`rechazar_pedido` | Flujo de trabajo para creación, revisión y aprobación/rechazo de pedidos. |
| **Órdenes de Trabajo** | `ver_orden_trabajo`<br>`editar_orden_trabajo`                                               | Permisos específicos para logística para ver y modificar órdenes.         |

## Anexos

- [Diagrama de flujo de creación de usuario](./flujo-creacion-usuario.png)
- [Modelo Entidad-Relación](./modelo-er.png)
