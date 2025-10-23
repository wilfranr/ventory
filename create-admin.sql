-- 1. Crear la empresa si no existe
INSERT OR IGNORE INTO "Company" (id, name, slug, nit, status, "createdAt", "updatedAt")
VALUES ('cmp_' || substr(hex(randomblob(16)), 1, 16), 'Empresa Principal', 'empresa-principal', '123456789-0', 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Obtener el ID de la empresa
WITH company_id AS (
  SELECT id FROM "Company" WHERE name = 'Empresa Principal' LIMIT 1
),

-- 3. Insertar permisos si no existen
permissions_to_add AS (
  SELECT 'crear_usuario' as name UNION ALL
  SELECT 'ver_usuarios' UNION ALL
  SELECT 'editar_usuario' UNION ALL
  SELECT 'eliminar_usuario' UNION ALL
  SELECT 'crear_rol' UNION ALL
  SELECT 'ver_roles' UNION ALL
  SELECT 'asignar_rol' UNION ALL
  SELECT 'crear_pedido' UNION ALL
  SELECT 'ver_pedidos' UNION ALL
  SELECT 'editar_pedido' UNION ALL
  SELECT 'aprobar_pedido' UNION ALL
  SELECT 'rechazar_pedido' UNION ALL
  SELECT 'ver_orden_trabajo' UNION ALL
  SELECT 'editar_orden_trabajo' UNION ALL
  SELECT 'modificar_parametros_empresa'
)
INSERT OR IGNORE INTO "Permission" (id, name, "createdAt", "updatedAt")
SELECT 'perm_' || substr(hex(randomblob(16)), 1, 16), name, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM permissions_to_add
WHERE name NOT IN (SELECT name FROM "Permission");

-- 4. Crear el rol admin si no existe
INSERT OR IGNORE INTO "Role" (id, name, "companyId", "createdAt", "updatedAt")
SELECT 'role_' || substr(hex(randomblob(16)), 1, 16), 'admin', id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM company_id
WHERE NOT EXISTS (SELECT 1 FROM "Role" WHERE name = 'admin' AND "companyId" = (SELECT id FROM company_id));

-- 5. Obtener el ID del rol admin
WITH admin_role AS (
  SELECT id FROM "Role" WHERE name = 'admin' AND "companyId" = (SELECT id FROM company_id) LIMIT 1
)

-- 6. Asignar todos los permisos al rol admin
INSERT OR IGNORE INTO "_RoleToPermissions" ("A", "B")
SELECT r.id, p.id
FROM admin_role r
CROSS JOIN "Permission" p
WHERE (r.id, p.id) NOT IN (SELECT "A", "B" FROM "_RoleToPermissions");

-- 7. Crear el usuario administrador
WITH company_id AS (SELECT id FROM "Company" WHERE name = 'Empresa Principal' LIMIT 1),
     admin_role AS (SELECT id FROM "Role" WHERE name = 'admin' AND "companyId" = (SELECT id FROM company_id) LIMIT 1)
INSERT OR REPLACE INTO "User" (id, name, email, password, status, "companyId", "roleId", "createdAt", "updatedAt")
SELECT 'user_' || substr(hex(randomblob(16)), 1, 16), 'Administrador', 'admin@ventory.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'activo', 
       (SELECT id FROM company_id), 
       (SELECT id FROM admin_role),
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'admin@ventory.com');

-- 8. Mostrar información del usuario creado
SELECT 'Usuario administrador creado exitosamente:' as message;
SELECT 'Email: admin@ventory.com' as credential;
SELECT 'Contraseña: 896995' as credential;
