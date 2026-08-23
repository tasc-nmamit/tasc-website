import { db } from "./db";

/**
 * Generates a random 6-character alphanumeric team code.
 */
function generateRandomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a unique team code. Checks against the database to ensure no collisions.
 */
export async function generateUniqueTeamCode(): Promise<string> {
  let code = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    code = generateRandomCode();
    const existingTeam = await db.team.findUnique({
      where: { teamCode: code },
    });
    if (!existingTeam) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Failed to generate a unique team code");
  }

  return code;
}
