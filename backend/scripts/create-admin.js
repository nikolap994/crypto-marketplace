const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const username = "admin"; // change as needed
  const password = "admin"; // change as needed

  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: {
      username,
      password: hash,
    },
  });

  console.log("Admin created:", admin);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());