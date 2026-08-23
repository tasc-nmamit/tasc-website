const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const sql = fs.readFileSync('schema.sql', 'utf8');
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  await client.connect();

  try {
    console.log("Dropping existing enums to avoid conflicts...");
    await client.query(`DROP TYPE IF EXISTS "Role", "EventType", "EventStatus", "TeamStatus", "WinnerType", "CareerIntent";`);
    
    console.log("Applying schema.sql to the database...");
    await client.query(sql);
    console.log("Schema applied successfully! Database is now in sync.");
  } catch (error) {
    console.error("Error applying schema:", error);
  } finally {
    await client.end();
  }
}

main();
