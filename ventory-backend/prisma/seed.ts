import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const companyId = await seedCompany();
  if (companyId) {
    await seedPermissionsAndRoles(companyId);
    await seedSuperadminUser(companyId);
  }
}

async function seedPermissionsAndRoles(companyId: string) {
  // --- AJUSTE 2: Añadir nuevos permisos para Activos ---
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
    // Nuevos permisos
    "crear_activo",
    "ver_activos",
    "editar_activo",
    "eliminar_activo",
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // --- AJUSTE 3: Añadir rol faltante ---
  const roles = [
    "superadmin",
    "admin",
    "vendedor",
    "logistica",
    "propietario",
    "analistaPartes", // Rol añadido
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

  // --- AJUSTE 3: Asignar nuevos permisos a los roles ---
  const rolePermissionsMap: Record<string, string[]> = {
    superadmin: permissions, // Superadmin tiene todos los permisos
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
      // Permisos de activos para admin
      "crear_activo",
      "ver_activos",
      "editar_activo",
      "eliminar_activo",
    ],
    vendedor: [
      "crear_pedido",
      "ver_pedidos",
      "editar_pedido",
      "aprobar_pedido",
      "rechazar_pedido",
    ],
    analistaPartes: ["ver_pedidos", "editar_pedido", "ver_activos"], // Puede ver activos
    logistica: ["ver_orden_trabajo", "editar_orden_trabajo", "ver_activos"], // Puede ver activos
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
      // Permisos de activos para propietario
      "crear_activo",
      "ver_activos",
      "editar_activo",
      "eliminar_activo",
    ],
  };

  for (const roleName of Object.keys(rolePermissionsMap)) {
    const role = await prisma.role.findUnique({
      where: {
        name_companyId: {
          name: roleName,
          companyId: companyId,
        },
      },
    });
    if (!role) continue;

    const permissionNames = rolePermissionsMap[roleName] || [];
    const rolePermissions = await prisma.permission.findMany({
      where: { name: { in: permissionNames } },
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
      // --- AJUSTE 1: Activar el módulo de activos para esta empresa ---
      hasAssetTrackingModule: true,
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
    console.error(
      "Error: Rol 'superadmin' no encontrado para crear el usuario.",
    );
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(
      "El usuario superadmin ya existe. Creación de usuario cancelada.",
    );
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

