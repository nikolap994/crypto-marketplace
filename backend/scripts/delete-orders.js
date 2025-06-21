const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.order.deleteMany({});
  console.log("All orders deleted.");
}

main().finally(() => prisma.$disconnect());