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

  // ✅ Asociar todos los permisos al rol "superadmin"
  const allPermissions = await prisma.permission.findMany();
  const superadmin = await prisma.role.findUnique({
    where: { name: "superadmin" },
  });

  if (superadmin) {
    await prisma.role.update({
      where: { id: superadmin.id },
      data: {
        permissions: {
          set: allPermissions.map((p) => ({ id: p.id })),
        },
      },
    });
  }

  // 🔐 Crear empresa + usuario superadmin (como tenías antes)
  const companyName = "Heavy Market";
  const nit = "123456789";
  const email = "admin@heavymarket.com";
  const password = "admin123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.company.findUnique({ where: { nit } });
  if (existing) {
    console.log("La empresa ya existe. Seed cancelado.");
    return;
  }

  await prisma.company.create({
    data: {
      name: companyName,
      slug: slugify(companyName, { lower: true, strict: true }),
      nit,
      email: "info@heavymarket.com",
      address: "Calle 123",
      phones: "3001234567",
      website: "https://heavymarket.com",
      users: {
        create: {
          name: "Super Admin",
          email,
          password: hashedPassword,
          roleId: superadmin?.id,
        },
      },
    },
  });

  console.log("✅ Seed ejecutado correctamente con permisos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
