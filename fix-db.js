const { PrismaClient } = require('./.generated/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Dropping public schema to cleanly reset database...");
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS public CASCADE;`);
    await prisma.$executeRawUnsafe(`CREATE SCHEMA public;`);
    console.log("Schema reset successful!");
  } catch (error) {
    console.error("Error resetting schema:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
