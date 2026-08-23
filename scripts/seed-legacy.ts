import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

function run() {
  console.log("Reading 02_seed.sql...");
  const seedPath = path.join(process.cwd(), 'pgprod', 'initdb', '02_seed.sql');
  let sql = fs.readFileSync(seedPath, 'utf8');

  console.log("Transforming schema differences...");
  
  // Replace EventCategory with EventStatus logic
  // category -> status
  sql = sql.replace(/, category, /g, ', status, ');
  
  // The user requested all previous events to be marked as completed.
  // The old categories were PREVIOUS, UPCOMING, CURRENT.
  // We'll map all of them to COMPLETED.
  sql = sql.replace(/'PREVIOUS'/g, "'COMPLETED'");
  sql = sql.replace(/'UPCOMING'/g, "'COMPLETED'");
  sql = sql.replace(/'CURRENT'/g, "'COMPLETED'");

  // Disable foreign key checks for the session if we were in Postgres, 
  // but Cockroach doesn't support session_replication_role.
  // However, the INSERT statements in 02_seed.sql seem to be ordered correctly 
  // (User before Core, etc.) so we might not need to disable FKs.
  // Let's write the modified SQL to a temporary file
  const outPath = path.join(process.cwd(), 'pgprod', 'initdb', '02_seed_cleaned.sql');
  fs.writeFileSync(outPath, sql);

  console.log("Executing seed script via psql...");
  // Get database url from .env
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/^DATABASE_URL="?([^"\n]+)"?/m);
  
  if (!dbUrlMatch) {
    throw new Error("DATABASE_URL not found in .env");
  }
  
  const dbUrl = dbUrlMatch[1];
  
  try {
    execSync(`psql "${dbUrl}" -f "${outPath}"`, { stdio: 'inherit' });
    console.log("Database seeded successfully!");
  } catch (err: any) {
    console.error("Error executing seed:", err.message);
  }
}

run();
