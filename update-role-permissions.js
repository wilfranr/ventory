const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateRolePermissions() {
  try {
    // 1. Obtener el rol 'propietario'
    const role = await prisma.role.findFirst({
      where: { name: 'propietario' },
      include: { permissions: true }
    });

    if (!role) {
      console.error('No se encontró el rol "propietario"');
      return;
    }

    console.log(`Rol encontrado: ${role.name} (ID: ${role.id})`);
    console.log('Permisos actuales:', role.permissions.map(p => p.name).join(', ') || 'Ninguno');

    // 2. Obtener todos los permisos disponibles
    const allPermissions = await prisma.permission.findMany();
    console.log('\nPermisos disponibles:', allPermissions.map(p => p.name).join(', '));

    // 3. Actualizar los permisos del rol
    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: allPermissions.map(p => ({ id: p.id }))
        }
      }
    });

    console.log('\n✅ Permisos actualizados exitosamente!');
    
    // 4. Verificar la actualización
    const updatedRole = await prisma.role.findUnique({
      where: { id: role.id },
      include: { permissions: true }
    });
    
    console.log('\nPermisos actualizados:', updatedRole.permissions.map(p => p.name).join(', '));
  } catch (error) {
    console.error('Error al actualizar permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRolePermissions();
