import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const companyId = await seedCompany(); // Create company first
  if (companyId) {
    await seedPermissionsAndRoles(companyId); // Then seed permissions and roles for that company
    await seedSuperadminUser(companyId); // Finally, create the superadmin user
  }
}

async function seedPermissionsAndRoles(companyId: string) {
  // 🧩 Crear permisos base
  const permissions = [
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
    "rechazar_pedido",
    "ver_orden_trabajo",
    "editar_orden_trabajo",
    "modificar_parametros_empresa",
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 🧩 Crear roles base
  const roles = [
    "superadmin",
    "admin",
    "vendedor",
    "logistica",
    "propietario",
  ];

  for (const name of roles) {
    await prisma.role.upsert({
      where: {
        name_companyId: {
          name: name,
          companyId: companyId,
        },
      },
      update: {},
      create: {
        name: name,
        companyId: companyId,
      },
    });
  }

  // 🛡️ Asignar permisos a cada rol
  const rolePermissionsMap: Record<string, string[]> = {
    superadmin: permissions,
    admin: [
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
    ],
    vendedor: [
      "crear_pedido",
      "ver_pedidos",
      "editar_pedido",
      "aprobar_pedido",
      "rechazar_pedido",
    ],
    analistaPartes: ["ver_pedidos", "editar_pedido"],
    logistica: ["ver_orden_trabajo", "editar_orden_trabajo"],
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
      "modificar_parametros_empresa",
    ],
  };

  for (const roleName of roles) {
    const role = await prisma.role.findUnique({
      where: {
        name_companyId: { // Use compound unique input
          name: roleName,
          companyId: companyId,
        },
      },
    });
    if (!role) continue;

    const permissionNames = rolePermissionsMap[roleName] || [];

    const rolePermissions = await prisma.permission.findMany({
      where: {
        name: { in: permissionNames },
      },
    });

    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: rolePermissions.map((p) => ({ id: p.id })),
        },
      },
    });
  }
  console.log("✅ Permisos y roles actualizados correctamente.");
}

async function seedCompany(): Promise<string | undefined> {
  const companyName = "VENTORY";
  const nit = "80896995-0";

  const existing = await prisma.company.findUnique({ where: { nit } });
  if (existing) {
    console.log("La empresa ya existe. Seed de empresa cancelado.");
    return existing.id;
  }

  const company = await prisma.company.create({
    data: {
      name: companyName,
      slug: slugify(companyName, { lower: true, strict: true }),
      nit,
      email: "info@ventory.com",
      address: "Calle 123",
      phones: "3001234567",
      website: "https://ventory.com",
    },
  });

  console.log("✅ Empresa creada correctamente.");
  return company.id;
}

async function seedSuperadminUser(companyId: string) {
  const email = "info@ventory.com";
  const password = "896995";
  const hashedPassword = await bcrypt.hash(password, 10);

  const superadminRole = await prisma.role.findUnique({
    where: {
      name_companyId: {
        name: "superadmin",
        companyId: companyId,
      },
    },
  });

  if (!superadminRole) {
    console.error("Error: Rol 'superadmin' no encontrado para crear el usuario.");
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log("El usuario superadmin ya existe. Creación de usuario cancelada.");
    return;
  }

  await prisma.user.create({
    data: {
      name: "Yoseth",
      email,
      password: hashedPassword,
      roleId: superadminRole.id,
      companyId: companyId,
      status: "activo",
    },
  });
  console.log("✅ Usuario superadmin creado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });