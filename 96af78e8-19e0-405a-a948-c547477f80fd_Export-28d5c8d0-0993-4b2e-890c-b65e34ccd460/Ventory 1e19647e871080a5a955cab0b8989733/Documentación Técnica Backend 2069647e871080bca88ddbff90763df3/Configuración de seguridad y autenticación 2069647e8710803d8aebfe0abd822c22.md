# Configuración de seguridad y autenticación

## 

- **Autenticación**: Se utiliza JWT para la autenticación de usuarios.
- **Protección de rutas**: Los endpoints se protegen mediante guards personalizados (`JwtAuthGuard`, `PermissionsGuard`).
- **Roles y permisos**: El acceso a cada ruta depende del permiso asignado al rol del usuario.
- **Prácticas recomendadas**:
    - Nunca expongas secretos o tokens en el repositorio.
    - Usa variables de entorno (`.env`) para credenciales sensibles.
    - Actualiza las dependencias de seguridad regularmente.