# Rutas protegidas por permisos

# Rutas protegidas por permisos

Esta sección documenta cómo funciona la protección de rutas en Ventory, incluyendo los endpoints públicos (acceso libre) y los protegidos por permisos, organizados por módulo.

---

## 🔐 Protección de rutas y permisos

- Se usan **guards globales** (`JwtAuthGuard` y `PermissionsGuard`) para proteger toda la API.
- Los endpoints de **login** y **registro** se declaran como públicos usando el decorador `@Public()`.
- Todas las rutas no públicas requieren un **token JWT válido** y el **permiso correspondiente**.

---

### Endpoints públicos (`@Public()`)

| Ruta | Método | Descripción |
| --- | --- | --- |
| /auth/login | POST | Login de usuario |
| /auth/register | POST | Registro de usuario/empresa |

---

## Endpoints protegidos por permisos

### Usuarios

| Ruta | Método | Permiso | Descripción |
| --- | --- | --- | --- |
| /users | GET | ver_usuarios | Listar usuarios |
| /users/:id | PUT | editar_usuario | Editar usuario |

---

### Roles

| Ruta | Método | Permiso | Descripción |
| --- | --- | --- | --- |
| /roles | GET | ver_roles | Listar roles |
| /roles | POST | crear_rol | Crear nuevo rol |
| /roles/:roleId/permissions | PATCH | asignar_permisos | Asignar permisos a un rol existente |
| /roles/:id | DELETE | eliminar_rol | Eliminar rol |

---

### Permisos

| Ruta | Método | Permiso | Descripción |
| --- | --- | --- | --- |
| /permissions | GET | ver_permisos | Listar permisos |

---

### Pedidos

| Ruta | Método | Permiso | Descripción |
| --- | --- | --- | --- |
| /orders | POST | crear_pedido | Crear nuevo pedido |
| /orders/:id | DELETE | eliminar_pedido | Eliminar un pedido |

---

## Notas técnicas

- Los permisos requeridos están definidos y gestionados en la tabla **permissions** en la base de datos.
- Los roles pueden tener múltiples permisos, y estos se asignan con el endpoint `/roles/:roleId/permissions`.
- Los endpoints de login y registro quedan excluidos de la autenticación JWT usando el decorador `@Public()` para una experiencia segura y flexible.
- Puedes agregar nuevos endpoints y permisos siguiendo esta convención y actualizando la tabla de permisos y la documentación.