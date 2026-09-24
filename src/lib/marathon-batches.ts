import { parseNmamitEmail } from "@/lib/email-parser";

export type MarathonBatch = "2A" | "2B" | "3A1" | "3A2";

export const MARATHON_BATCHES: MarathonBatch[] = ["2A", "2B", "3A1", "3A2"];

export interface BatchInfo {
  name: MarathonBatch;
  label: string;
  description: string;
  year: number;
}

export const BATCH_DETAILS: Record<MarathonBatch, BatchInfo> = {
  "2A": {
    name: "2A",
    label: "Batch 2A",
    description: "2nd Year AIML Sec A (USN_A_SEC.xlsx + 26DIPAM 01, 02, 03, 07)",
    year: 2,
  },
  "2B": {
    name: "2B",
    label: "Batch 2B",
    description: "2nd Year AIML Sec B (NN25AIM up to 144 + 26DIPAM 04, 05, 06)",
    year: 2,
  },
  "3A1": {
    name: "3A1",
    label: "Batch 3A1",
    description: "3rd Year AIML (NNM24AM001 - NNM24AM039)",
    year: 3,
  },
  "3A2": {
    name: "3A2",
    label: "Batch 3A2",
    description: "3rd Year AIML (NNM24AM040 - NNM24AM072 + Diploma NNM25AM501 - NNM25AM506)",
    year: 3,
  },
};

/**
 * Exact list of 74 USNs belonging to 2A from USN_A_SEC.xlsx:
 * Includes 4 diploma students (26DIPAM01, 02, 03, 07) and 70 regular students.
 */
export const BATCH_2A_USN_LIST = [
  "26DIPAM01",
  "26DIPAM02",
  "26DIPAM03",
  "26DIPAM07",
  "NN25AIM001",
  "NN25AIM002",
  "NN25AIM003",
  "NN25AIM004",
  "NN25AIM005",
  "NN25AIM006",
  "NN25AIM007",
  "NN25AIM008",
  "NN25AIM009",
  "NN25AIM010",
  "NN25AIM011",
  "NN25AIM012",
  "NN25AIM013",
  "NN25AIM014",
  "NN25AIM015",
  "NN25AIM016",
  "NN25AIM017",
  "NN25AIM018",
  "NN25AIM019",
  "NN25AIM020",
  "NN25AIM021",
  "NN25AIM022",
  "NN25AIM023",
  "NN25AIM024",
  "NN25AIM025",
  "NN25AIM026",
  "NN25AIM027",
  "NN25AIM028",
  "NN25AIM029",
  "NN25AIM030",
  "NN25AIM032",
  "NN25AIM033",
  "NN25AIM034",
  "NN25AIM035",
  "NN25AIM036",
  "NN25AIM037",
  "NN25AIM038",
  "NN25AIM039",
  "NN25AIM040",
  "NN25AIM041",
  "NN25AIM042",
  "NN25AIM043",
  "NN25AIM044",
  "NN25AIM045",
  "NN25AIM047",
  "NN25AIM048",
  "NN25AIM049",
  "NN25AIM050",
  "NN25AIM051",
  "NN25AIM052",
  "NN25AIM053",
  "NN25AIM054",
  "NN25AIM055",
  "NN25AIM056",
  "NN25AIM057",
  "NN25AIM058",
  "NN25AIM059",
  "NN25AIM060",
  "NN25AIM061",
  "NN25AIM062",
  "NN25AIM063",
  "NN25AIM064",
  "NN25AIM065",
  "NN25AIM066",
  "NN25AIM067",
  "NN25AIM068",
  "NN25AIM069",
  "NN25AIM070",
  "NN25AIM129",
  "NN25AIM145",
] as const;

export const BATCH_2A_USN_SET = new Set<string>(
  BATCH_2A_USN_LIST.map((u) => u.toUpperCase())
);

// Roll numbers of NN25AIM students in Batch 2A
export const BATCH_2A_ROLLS = new Set<number>([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 47, 48, 49, 50,
  51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
  61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
  129, 145,
]);

// 26DIPAM rolls:
// 2A: 01, 02, 03, 07
// 2B: 04, 05, 06
export const BATCH_2A_DIPAM_ROLLS = new Set<number>([1, 2, 3, 7]);
export const BATCH_2B_DIPAM_ROLLS = new Set<number>([4, 5, 6]);

// Last USN of 2B
export const BATCH_2B_MAX_ROLL = 144;

/**
 * Resolves which batch a student belongs to using USN or Email.
 *
 * Rules:
 * 2A: USNs listed in USN_A_SEC.xlsx (including 26DIPAM01, 02, 03, 07 and regular rolls)
 * 2B: Rest of NN25AIM up to 144 (not in 2A) + 26DIPAM04, 05, 06
 * 3A1: NNM24AM001 - NNM24AM039
 * 3A2: NNM24AM040 - NNM24AM072 + Diploma NNM25AM501 - NNM25AM506
 */
export function getBatchForUser(user: { email?: string | null; usn?: string | null }): MarathonBatch | null {
  const rawUsn = (user.usn || "").toUpperCase().trim().replace(/\s+/g, "");
  const rawEmail = (user.email || "").toLowerCase().trim();

  // 1. Direct check against the verified 2A list
  if (rawUsn && BATCH_2A_USN_SET.has(rawUsn)) {
    return "2A";
  }

  // 2. Check for 26DIPAM diploma students in USN or Email
  // e.g. 26DIPAM01, 26DIPAM04, dip26am04@nmamit.in, 26dipam01@nmamit.in
  const dipamMatch =
    rawUsn.match(/(?:26DIPAM|DIP26AM)(\d+)/i) ||
    rawEmail.match(/(?:26dipam|dip26am)(\d+)/i);

  if (dipamMatch) {
    const roll = parseInt(dipamMatch[1], 10);
    if (BATCH_2A_DIPAM_ROLLS.has(roll)) return "2A";
    if (BATCH_2B_DIPAM_ROLLS.has(roll)) return "2B";
    // Default fallback for any other 26dipam
    return BATCH_2A_USN_SET.has(rawUsn) ? "2A" : "2B";
  }

  // 3. Check for 2nd Year Regular Students (NN25AIM)
  const nn25Match =
    rawUsn.match(/NN25AIM(\d+)/i) ||
    rawEmail.match(/nn25aim(\d+)/i);

  if (nn25Match) {
    const roll = parseInt(nn25Match[1], 10);
    const normalizedUSN = `NN25AIM${String(roll).padStart(3, "0")}`;

    if (BATCH_2A_USN_SET.has(normalizedUSN) || BATCH_2A_ROLLS.has(roll)) {
      return "2A";
    }

    // All other NN25AIM up to 144 belong to 2B
    if (roll <= BATCH_2B_MAX_ROLL) {
      return "2B";
    }
  }

  // 4. Check for 3rd Year Batches
  // NNM24AM: 3A1 (1-39), 3A2 (40-72)
  const nnm24Match =
    rawUsn.match(/NNM24AM(\d+)/i) ||
    rawEmail.match(/nnm24am(\d+)/i);

  if (nnm24Match) {
    const roll = parseInt(nnm24Match[1], 10);
    if (roll >= 1 && roll <= 39) return "3A1";
    if (roll >= 40 && roll <= 72) return "3A2";
  }

  // 3rd year lateral entry diploma: NNM25AM501-506 -> 3A2
  const nnm25Match =
    rawUsn.match(/NNM25AM(\d+)/i) ||
    rawEmail.match(/nnm25am(\d+)/i);

  if (nnm25Match) {
    const roll = parseInt(nnm25Match[1], 10);
    if (roll >= 501 && roll <= 506) return "3A2";
  }

  // 5. Fallback via parseNmamitEmail
  if (user.email) {
    const parsed = parseNmamitEmail(user.email);
    if (parsed && parsed.isAiml) {
      // 2025 joining year (2nd year regular)
      if (parsed.joiningYear === 2025) {
        if (BATCH_2A_ROLLS.has(parsed.rollNumber)) return "2A";
        if (parsed.rollNumber <= BATCH_2B_MAX_ROLL) return "2B";
      }

      // 2024 joining year (3rd year regular)
      if (parsed.joiningYear === 2024) {
        if (parsed.rollNumber >= 1 && parsed.rollNumber <= 39) return "3A1";
        if (parsed.rollNumber >= 40 && parsed.rollNumber <= 72) return "3A2";
      }

      // 2026 lateral diploma (2nd year diploma)
      if (parsed.joiningYear === 2026 && parsed.isLateral) {
        if (BATCH_2A_DIPAM_ROLLS.has(parsed.rollNumber)) return "2A";
        if (BATCH_2B_DIPAM_ROLLS.has(parsed.rollNumber)) return "2B";
      }
    }
  }

  return null;
}
