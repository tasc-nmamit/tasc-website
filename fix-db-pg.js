const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();

  try {
    console.log("Dropping Faculty.order column...");
    await client.query(`ALTER TABLE "Faculty" DROP COLUMN "order";`);
    console.log("Dropped successfully!");
  } catch (error) {
    console.error("Error dropping column:", error);
  } finally {
    await client.end();
  }
}

main();
