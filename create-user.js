const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Verificar si la empresa existe, si no, crearla
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Empresa Principal',
          slug: 'empresa-principal',
          nit: '123456789-0',
          status: 'activo'
        }
      });
      console.log('Empresa creada:', company);
    }

    // 2. Verificar si el rol admin existe, si no, crearlo con todos los permisos
    let adminRole = await prisma.role.findFirst({
      where: { name: 'admin' },
      include: { permissions: true }
    });

    if (!adminRole) {
      // Obtener todos los permisos
      const allPermissions = await prisma.permission.findMany();
      
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          companyId: company.id,
          permissions: {
            connect: allPermissions.map(p => ({ id: p.id }))
          }
        },
        include: {
          permissions: true
        }
      });
      console.log('Rol admin creado con todos los permisos');
    }

    // 3. Crear el usuario administrador
    const hashedPassword = await bcrypt.hash('896995', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'admin@ventory.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@ventory.com',
        password: hashedPassword,
        status: 'activo',
        companyId: company.id,
        roleId: adminRole.id
      }
    });

    console.log('Usuario administrador creado exitosamente:');
    console.log('- Email: admin@ventory.com');
    console.log('- Contraseña: 896995');
    console.log('\nPor favor, inicia sesión y cambia la contraseña inmediatamente.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
