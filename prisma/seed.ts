import { seedCatalogDatabase } from "../src/lib/catalog-db";
import { prisma } from "../src/lib/prisma";

async function main() {
  await seedCatalogDatabase();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
