/**
 * Seed script for 2025-26 academic year events.
 *
 * Usage:
 *   npx tsx scripts/seed-events-2025-26.ts
 *
 * This script reads DATABASE_URL from .env and inserts events directly
 * into the database using Prisma. All events are created with
 * published=true and status=COMPLETED (since they're past events).
 *
 * ─────────────────────────────────────────────────────────────────────
 * HOW TO ADD YOUR EVENTS:
 *
 * Each event in the EVENTS array needs these fields:
 *   - title        (string)   — Event name
 *   - description  (string)   — Brief description
 *   - image        (string)   — URL to event poster/image
 *   - date         (string)   — Date in YYYY-MM-DD format (must be between July 2025 – June 2026)
 *   - time         (string?)  — Optional, in HH:MM format (24hr)
 *   - venue        (string?)  — Optional, location
 *   - type         ("SOLO"|"TEAM") — Event type
 *   - guests       (string[]) — Optional, guest speaker names
 *   - reportLink   (string?)  — Optional, link to event report
 *
 * Simply edit the EVENTS array below with your real data, then run the script.
 * ─────────────────────────────────────────────────────────────────────
 */

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const EVENTS = [
  // ──────────────── SAMPLE EVENTS (replace with real data) ────────────────
  {
    title: "Inauguration Ceremony 2025-26",
    description:
      "The grand inauguration of TASC activities for the academic year 2025-26, featuring keynote speakers and cultural performances.",
    image: "https://placehold.co/800x400/1a1a2e/e94560?text=Inauguration+2025-26",
    date: "2025-08-15",
    time: "10:00",
    venue: "NMAMIT Seminar Hall",
    type: "SOLO" as const,
    guests: ["Dr. Principal", "Prof. HOD AIML"],
    reportLink: null,
  },
  {
    title: "CodeSprint 3.0",
    description:
      "An intense competitive programming contest testing algorithmic problem solving skills. Open to all AIML students.",
    image: "https://placehold.co/800x400/16213e/0f3460?text=CodeSprint+3.0",
    date: "2025-09-20",
    time: "14:00",
    venue: "AIML Lab 1 & 2",
    type: "SOLO" as const,
    guests: [],
    reportLink: null,
  },
  {
    title: "TechTalk: AI in Healthcare",
    description:
      "An expert-led session exploring real-world applications of Artificial Intelligence in modern healthcare and diagnostics.",
    image: "https://placehold.co/800x400/1b1b2f/c471ed?text=TechTalk+AI+Healthcare",
    date: "2025-11-10",
    time: "11:00",
    venue: "NMAMIT Auditorium",
    type: "SOLO" as const,
    guests: ["Dr. Industry Expert"],
    reportLink: null,
  },
  {
    title: "Hackathon: Build for Good",
    description:
      "A 24-hour hackathon challenging teams to build solutions for social good. Mentors from top tech companies.",
    image: "https://placehold.co/800x400/0d1117/58a6ff?text=Hackathon+Build+For+Good",
    date: "2026-01-25",
    time: "09:00",
    venue: "NMAMIT Campus",
    type: "TEAM" as const,
    guests: [],
    reportLink: null,
  },
  {
    title: "AIML Project Expo 2026",
    description:
      "Annual project exhibition showcasing innovative AI/ML projects built by students throughout the year.",
    image: "https://placehold.co/800x400/2d2d44/ff6b6b?text=Project+Expo+2026",
    date: "2026-04-15",
    time: "10:00",
    venue: "NMAMIT Exhibition Hall",
    type: "TEAM" as const,
    guests: ["Industry Panel"],
    reportLink: null,
  },
  // ──────────────── ADD MORE EVENTS BELOW ────────────────
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL not found in .env");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const db = new PrismaClient({ adapter });

  console.log(`\n📋 Seeding ${EVENTS.length} events for academic year 2025-26...\n`);

  let created = 0;
  let failed = 0;

  for (const event of EVENTS) {
    try {
      const eventDate = new Date(event.date);

      await db.event.create({
        data: {
          title: event.title,
          description: event.description,
          image: event.image,
          date: eventDate,
          time: event.time || null,
          venue: event.venue || null,
          type: event.type,
          status: "COMPLETED",
          published: true,
          guests: event.guests || [],
          reportLink: event.reportLink || null,
          registrationsAvailable: false,
          minTeamSize: event.type === "TEAM" ? 2 : 1,
          maxTeamSize: event.type === "TEAM" ? 4 : 1,
        },
      });

      console.log(`  ✅ ${event.title} (${event.date})`);
      created++;
    } catch (err: any) {
      console.error(`  ❌ Failed: ${event.title} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n──────────────────────────────────`);
  console.log(`  ✅ Created: ${created}`);
  if (failed > 0) console.log(`  ❌ Failed:  ${failed}`);
  console.log(`──────────────────────────────────\n`);

  await db.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
