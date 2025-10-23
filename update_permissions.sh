#!/bin/bash

# Ruta a la base de datos
DB_PATH="/home/yoseth/Documentos/Dev/angular/ventory/ventory-backend/prisma/dev.db"

# ID del rol propietario
ROLE_ID="cmfa6y3wu0002c6kwghmxgu9y"

# Eliminar permisos existentes
echo "Eliminando permisos existentes..."
sqlite3 "$DB_PATH" "DELETE FROM \"_RoleToPermissions\" WHERE \"A\" = '$ROLE_ID';"

# Asignar todos los permisos disponibles
echo "Asignando nuevos permisos..."
sqlite3 "$DB_PATH" <<EOF
-- Crear, ver, editar, eliminar usuarios
INSERT INTO "_RoleToPermissions" ("A", "B") VALUES
('$ROLE_ID', 'cmfa0n1f40001c6jaj23wtjlt'),  -- crear_usuario
('$ROLE_ID', 'cmfa0n1fg0002c6jae47g7bx5'), -- ver_usuarios
('$ROLE_ID', 'cmfa0n1fq0003c6jabsij7n8e'), -- editar_usuario
('$ROLE_ID', 'cmfa0n1fz0004c6ja9t4k1st0'), -- eliminar_usuario
-- Roles
('$ROLE_ID', 'cmfa0n1g90005c6jaxszpcgq1'), -- crear_rol
('$ROLE_ID', 'cmfa0n1gj0006c6jab04atx27'), -- ver_roles
('$ROLE_ID', 'cmfa0n1gs0007c6jatqh6779h'), -- asignar_rol
-- Pedidos
('$ROLE_ID', 'cmfa0n1h00008c6jabuf8r22e'), -- crear_pedido
('$ROLE_ID', 'cmfa0n1h80009c6jazmcx25ki'), -- ver_pedidos
('$ROLE_ID', 'cmfa0n1hj000ac6ja5f55flw3'), -- editar_pedido
('$ROLE_ID', 'cmfa0n1hr000bc6jay959jy3q'), -- aprobar_pedido
('$ROLE_ID', 'cmfa0n1hy000cc6javqy92dfi'), -- rechazar_pedido
-- Ordenes de trabajo
('$ROLE_ID', 'cmfa0n1i6000dc6jafm4cbvye'), -- ver_orden_trabajo
('$ROLE_ID', 'cmfa0n1ie000ec6ja4ft3xlp4'), -- editar_orden_trabajo
-- Configuración de empresa
('$ROLE_ID', 'cmfa0n1io000fc6ja0yx2b6ko'); -- modificar_parametros_empresa
EOF

echo "Permisos actualizados exitosamente."
