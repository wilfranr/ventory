import { PrismaClient, RoleName } from "@prisma/client";
import * as bcrypt from "bcrypt";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
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
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 🧩 Crear roles base
  const roles: RoleName[] = [
    "superadmin",
    "admin",
    "vendedor",
    "analistaPartes",
    "logistica",
  ];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 🛡️ Asignar permisos a cada rol
  const rolePermissionsMap: Record<RoleName, string[]> = {
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
  };

  for (const roleName of roles) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
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

  // 🔐 Crear empresa + usuario superadmin
  const companyName = "VENTORY";
  const nit = "80896995-0";
  const email = "info@ventory.com";
  const password = "896995";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.company.findUnique({ where: { nit } });
  if (existing) {
    console.log("La empresa ya existe. Seed cancelado.");
    return;
  }

  const superadminRole = await prisma.role.findUnique({
    where: { name: "superadmin" },
  });

  await prisma.company.create({
    data: {
      name: companyName,
      slug: slugify(companyName, { lower: true, strict: true }),
      nit,
      email: "info@ventory.com",
      address: "Calle 123",
      phones: "3001234567",
      website: "https://ventory.com",
      users: {
        create: {
          name: "Yoseth",
          email,
          password: hashedPassword,
          roleId: superadminRole?.id,
        },
      },
    },
  });

  console.log("✅ Seed ejecutado correctamente con permisos por rol.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
