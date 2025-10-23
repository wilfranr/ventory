-- 1. Obtener el ID de la empresa
WITH company_id AS (
  SELECT id FROM "Company" LIMIT 1
),

-- 2. Obtener el ID del rol admin
admin_role AS (
  SELECT id FROM "Role" WHERE name = 'admin' LIMIT 1
),

-- 3. Crear el usuario administrador (si no existe)
new_user AS (
  INSERT INTO "User" (id, name, email, password, status, "companyId", "roleId", "createdAt", "updatedAt")
  SELECT 
    'user_' || substr(hex(randomblob(16)), 1, 16),
    'Administrador',
    'admin@ventory.com',
    -- Contraseña encriptada para '896995'
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'activo',
    (SELECT id FROM company_id),
    (SELECT id FROM admin_role),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'admin@ventory.com')
  RETURNING id
)

-- 4. Asignar todos los permisos al rol admin
INSERT INTO "_RoleToPermissions" ("A", "B")
SELECT r.id, p.id
FROM admin_role r
CROSS JOIN "Permission" p
WHERE NOT EXISTS (
  SELECT 1 
  FROM "_RoleToPermissions" rp 
  WHERE rp."A" = r.id AND rp."B" = p.id
);

-- 5. Mostrar información del usuario creado
SELECT 'Usuario administrador creado exitosamente:' as message;
SELECT 'Email: admin@ventory.com' as credential;
SELECT 'Contraseña: 896995' as credential;

-- Verificar que el usuario fue creado
SELECT u.id, u.name, u.email, u.status, r.name as role, c.name as company
FROM "User" u
JOIN "Role" r ON u."roleId" = r.id
JOIN "Company" c ON u."companyId" = c.id
WHERE u.email = 'admin@ventory.com';
