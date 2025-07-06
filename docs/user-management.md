# Gestión de Usuarios y Roles en Ventory

Este documento detalla los procesos de creación de usuarios y la asignación de roles dentro de la aplicación Ventory, incluyendo la introducción del nuevo rol `propietario`.

---

## 1. Flujos de Creación de Usuarios

Ventory soporta dos flujos principales para la creación de usuarios, adaptándose a diferentes escenarios de incorporación de empresas y empleados.

### 1.1. Flujo 1: Registro de Nueva Empresa (Sin Token)

Este flujo está diseñado para el primer usuario de una nueva empresa que se registra en Ventory. Al completar este proceso, el usuario no solo crea su cuenta, sino que también establece la empresa a la que pertenecerá.

*   **Quién lo realiza:** Un usuario que desea ser el administrador principal de una nueva empresa en Ventory.
*   **Proceso:**
    1.  El usuario accede a la interfaz de registro y selecciona la opción para "Registrar Empresa".
    2.  Completa sus datos personales (nombre, email, contraseña) y los datos de la nueva empresa (nombre de la empresa, NIT, dirección, etc.).
    3.  Envía el formulario.
*   **Resultado:**
    *   Se crea una nueva entrada en la base de datos para la empresa con los datos proporcionados.
    *   Se crea la cuenta del usuario.
    *   **Asignación de Rol:** Al usuario se le asigna automáticamente el rol de `propietario` para esa empresa.
    *   El usuario es redirigido a la página de inicio de sesión.
*   **Componentes Clave (Backend):**
    *   `AuthService.register`: Método principal que decide el flujo.
    *   `AuthService.registerWithCompany`: Lógica específica para la creación de empresa y asignación del rol `propietario`.
*   **Componentes Clave (Frontend):**
    *   `RegisterComponent`: Maneja el formulario de registro y la lógica `registerMode = 'newCompany'`.

### 1.2. Flujo 2: Unirse a una Empresa Existente (Con Token)

Este flujo permite a los administradores de empresas existentes invitar a nuevos usuarios a unirse a su organización, asignándoles un rol específico desde el inicio.

*   **Quién lo realiza:**
    1.  Un administrador (o `propietario`) de una empresa existente genera un token de invitación.
    2.  Un nuevo usuario utiliza este token para registrarse y unirse a la empresa.
*   **Proceso:**
    1.  **Generación del Token (por el Admin/Propietario):**
        *   Un usuario con permisos adecuados (ej. `admin`, `superadmin`, `propietario`) accede a una sección de la aplicación para generar tokens de registro.
        *   Selecciona el rol que desea asignar al nuevo usuario (ej. `vendedor`, `analistaPartes`).
        *   Se genera un token único asociado a la empresa del administrador y al rol seleccionado.
    2.  **Registro con Token (por el Nuevo Usuario):**
        *   El nuevo usuario accede a la interfaz de registro y selecciona la opción para "Registro con Token".
        *   Introduce sus datos personales (nombre, email, contraseña) y el token de invitación.
        *   Envía el formulario.
*   **Resultado:**
    *   Se valida el token de invitación. Si es válido y no ha sido usado, se consume.
    *   Se crea la cuenta del nuevo usuario.
    *   **Asignación de Empresa y Rol:** El usuario queda automáticamente asociado a la empresa que generó el token y se le asigna el rol predefinido en el token.
    *   El usuario es redirigido a la página de inicio de sesión.
*   **Componentes Clave (Backend):**
    *   `RegistrationTokenService.create`: Genera y almacena los tokens de invitación.
    *   `AuthService.register`: Método principal que decide el flujo.
    *   `AuthService.registerWithToken`: Lógica específica para el registro con token, validación y asignación de rol/empresa.
*   **Componentes Clave (Frontend):**
    *   `RegisterComponent`: Maneja el formulario de registro y la lógica `registerMode = 'joinCompany'`.

---

## 2. Gestión de Roles y Permisos

Ventory utiliza un sistema de roles y permisos para controlar el acceso a diferentes funcionalidades. Los roles se definen en el `enum RoleName` de Prisma y sus permisos se gestionan en el `prisma/seed.ts`.

### 2.1. Roles Definidos

*   **`superadmin`**: Rol con acceso total a todas las funcionalidades y datos de la aplicación, incluyendo la gestión de múltiples empresas.
*   **`propietario`**: (Nuevo Rol) Asignado al usuario que crea una nueva empresa. Tiene todos los permisos de un `admin` y, adicionalmente, la capacidad de modificar los parámetros generales de la empresa.
*   **`admin`**: Rol con amplios permisos para gestionar usuarios, roles y otras configuraciones dentro de su propia empresa.
*   **`vendedor`**: Rol con permisos relacionados con la creación, visualización y gestión de pedidos.
*   **`analistaPartes`**: Rol con permisos para visualizar y editar pedidos.
*   **`logistica`**: Rol con permisos para visualizar y editar órdenes de trabajo.

### 2.2. Permisos Asociados a Roles (Definidos en `prisma/seed.ts`)

El archivo `prisma/seed.ts` es la fuente de verdad para la asignación de permisos a cada rol. Cuando se ejecuta el seed, se asegura que los roles y sus permisos estén sincronizados con la base de datos.

**Ejemplo de Permisos para `propietario`:**

```typescript
propietario: [
  "crear_usuario",
  "ver_usuarios",
  "editar_usuario",
  "eliminar_usuario",
  "crear_rol",
  "ver_roles",
  "asignar_rol",
  "crear_pedido",
  "ver_pedidos",
  "editar_pedido",
  "aprobar_pedido",
  "modificar_parametros_empresa", // Permiso exclusivo del propietario
],
```

### 2.3. Componentes Clave en la Gestión de Roles

*   **Backend:**
    *   `prisma/schema.prisma`: Define el `enum RoleName` y las relaciones entre `User`, `Role` y `Permission`.
    *   `prisma/seed.ts`: Script para inicializar y actualizar roles y permisos en la base de datos.
    *   `AuthService`: Asigna roles durante el registro.
    *   `RolesGuard` (NestJS Guard): Protege las rutas del API basándose en los roles del usuario autenticado. Se asegura que el `user.role` (que es una cadena con el nombre del rol desde el JWT) se compare directamente con los roles requeridos.
    *   `@Roles()` Decorator: Utilizado en controladores para especificar qué roles tienen acceso a un endpoint.
    *   `UsersService.findByEmail`: Incluye la información del rol y la empresa del usuario al obtener sus datos.
*   **Frontend:**
    *   `AuthService`: Proporciona el `currentUser` con la información del rol.
    *   `CompanySettingsComponent`: Utiliza el rol del usuario para determinar si puede modificar los parámetros de la empresa.
    *   `AppTopbar`: Muestra el rol del usuario logueado.

---

## 3. Ajustes Recientes y Consideraciones

*   **Visualización Dinámica del Logo y Nombre de la Empresa:**
    *   El backend (`AuthService.login`) ahora devuelve la URL del logo de la empresa en la respuesta de inicio de sesión.
    *   El frontend (`AuthService.login` y `SessionService`) actualiza de forma reactiva el logo y el nombre de la empresa en el `AppTopbar` al iniciar sesión o al modificar la configuración de la empresa.
*   **Corrección de Errores:** Se corrigieron errores de compilación relacionados con la tipificación de `logo` y la declaración de variables en el frontend.

---
