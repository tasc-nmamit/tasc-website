import { db } from "./src/lib/db";

async function main() {
  try {
    console.log("Dropping public schema to cleanly reset database...");
    await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS public CASCADE;`);
    await db.$executeRawUnsafe(`CREATE SCHEMA public;`);
    console.log("Schema reset successful!");
  } catch (error) {
    console.error("Error resetting schema:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
