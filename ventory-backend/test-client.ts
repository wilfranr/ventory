import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("🧪 Modelos disponibles en PrismaClient:");
console.log(Object.keys(prisma)); // 👈 aquí deberías ver 'company'

async function main() {
  try {
    const companies = await prisma.company.findMany();
    console.log("🏢 Empresas:", companies);
  } catch (error) {
    console.error("❌ Error al ejecutar query:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
