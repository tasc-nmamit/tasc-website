/**
 * Parses NMAMIT student email addresses to extract structured information.
 *
 * Email patterns:
 * - nnm{YY}{branch}{NNN}@nmamit.in  — Regular students (3rd/4th year format)
 * - nn{YY}{branch}{NNN}@nmamit.in   — Alternate format (2nd year format)
 * - Numbers > 500 → lateral entry students
 *
 * Branch codes:
 * - am / aim → AIML (Artificial Intelligence & Machine Learning)
 * - cs / cse → CSE (Computer Science & Engineering)
 * - is       → ISE (Information Science & Engineering)
 * - ec       → ECE, me → Mechanical, cv → Civil, etc.
 *
 * Examples:
 *   nnm24am045@nmamit.in  → { joiningYear: 2024, branch: 'AM',  rollNum: 45,  isLateral: false, isAiml: true  }
 *   nnm25am502@nmamit.in  → { joiningYear: 2025, branch: 'AM',  rollNum: 502, isLateral: true,  isAiml: true  }
 *   nn25aim102@nmamit.in  → { joiningYear: 2025, branch: 'AIM', rollNum: 102, isLateral: false, isAiml: true  }
 *   nnm24is112@nmamit.in  → { joiningYear: 2024, branch: 'IS',  rollNum: 112, isLateral: false, isAiml: false }
 *   nnm23cs056@nmamit.in  → { joiningYear: 2023, branch: 'CS',  rollNum: 56,  isLateral: false, isAiml: false }
 *   nn25cse032@nmamit.in  → { joiningYear: 2025, branch: 'CSE', rollNum: 32,  isLateral: false, isAiml: false }
 */

export interface ParsedEmail {
  joiningYear: number; // Full year, e.g., 2024
  branch: string; // Uppercase branch code, e.g., 'AM', 'AIM', 'CS', 'IS'
  rollNumber: number;
  isLateral: boolean;
  isAiml: boolean;
  currentYear: number; // Computed: 2, 3, or 4 based on current academic year
  prefix: string; // 'nnm' or 'nn'
}

/**
 * Computes the current academic year of a student based on their joining year.
 * Academic year starts in August. A student who joined in 2024 is in:
 * - 2nd year if current date is between Aug 2025 and Jul 2026
 * - 3rd year if current date is between Aug 2026 and Jul 2027
 * - 4th year if current date is between Aug 2027 and Jul 2028
 */
function computeCurrentYear(joiningYear: number): number {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed (0=Jan, 7=Aug)
  const currentCalendarYear = now.getFullYear();

  // Academic year starts in August
  // If we're in Aug-Dec, the academic year is currentCalendarYear
  // If we're in Jan-Jul, the academic year is currentCalendarYear - 1
  const academicYearStart = currentMonth >= 7 ? currentCalendarYear : currentCalendarYear - 1;

  // Year of study = (academicYearStart - joiningYear) + 1
  const yearOfStudy = academicYearStart - joiningYear + 1;

  // Clamp to valid range 1-4
  return Math.max(1, Math.min(4, yearOfStudy));
}

const AIML_BRANCH_CODES = new Set(["AM", "AIM", "AI"]);

// Pattern: (nn|nnm|4nm){2-digit year}{branch code: 2-4 letters}{roll number: 2-4 digits}@nmamit.in
const EMAIL_REGEX = /^(nnm|nn|4nm)(\d{2})([a-zA-Z]{2,4})(\d{2,4})@nmamit\.in$/i;

// Diploma patterns: e.g. 26dipam01@nmamit.in or dip26am01@nmamit.in
const DIPLOMA_REGEX_A = /^(\d{2})dip([a-zA-Z]{2,4})(\d{1,4})@nmamit\.in$/i;
const DIPLOMA_REGEX_B = /^dip(\d{2})([a-zA-Z]{2,4})(\d{1,4})@nmamit\.in$/i;

/**
 * Parses an @nmamit.in email address and extracts student information.
 * Returns null if the email doesn't match any known pattern.
 */
export function parseNmamitEmail(email: string): ParsedEmail | null {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Regular NMAMIT student email
  const match = normalizedEmail.match(EMAIL_REGEX);
  if (match) {
    const [, prefix, yearStr, branchRaw, rollStr] = match;
    const joiningYearShort = parseInt(yearStr, 10);
    const joiningYear = 2000 + joiningYearShort;
    const branch = branchRaw.toUpperCase();
    const rollNumber = parseInt(rollStr, 10);
    const isLateral = rollNumber >= 500;
    const isAiml = AIML_BRANCH_CODES.has(branch);
    const currentYear = computeCurrentYear(joiningYear);

    return {
      joiningYear,
      branch,
      rollNumber,
      isLateral,
      isAiml,
      currentYear,
      prefix,
    };
  }

  // 2. Diploma lateral student email: {YY}dip{branch}{roll}@nmamit.in (e.g. 26dipam01@nmamit.in)
  const matchDipA = normalizedEmail.match(DIPLOMA_REGEX_A);
  if (matchDipA) {
    const [, yearStr, branchRaw, rollStr] = matchDipA;
    const joiningYearShort = parseInt(yearStr, 10);
    const joiningYear = 2000 + joiningYearShort;
    const branch = branchRaw.toUpperCase();
    const rollNumber = parseInt(rollStr, 10);
    const isAiml = AIML_BRANCH_CODES.has(branch);

    return {
      joiningYear,
      branch,
      rollNumber,
      isLateral: true,
      isAiml,
      currentYear: 2, // Diploma lateral students join directly into 2nd year
      prefix: "dip",
    };
  }

  // 3. Diploma lateral student email: dip{YY}{branch}{roll}@nmamit.in (e.g. dip26am01@nmamit.in)
  const matchDipB = normalizedEmail.match(DIPLOMA_REGEX_B);
  if (matchDipB) {
    const [, yearStr, branchRaw, rollStr] = matchDipB;
    const joiningYearShort = parseInt(yearStr, 10);
    const joiningYear = 2000 + joiningYearShort;
    const branch = branchRaw.toUpperCase();
    const rollNumber = parseInt(rollStr, 10);
    const isAiml = AIML_BRANCH_CODES.has(branch);

    return {
      joiningYear,
      branch,
      rollNumber,
      isLateral: true,
      isAiml,
      currentYear: 2, // Diploma lateral students join directly into 2nd year
      prefix: "dip",
    };
  }

  return null;
}

/**
 * Validates that an email belongs to @nmamit.in domain.
 */
export function isNmamitEmail(email: string): boolean {
  return email.toLowerCase().trim().endsWith("@nmamit.in");
}

/**
 * Validates that an email belongs to @nitte.edu.in faculty domain.
 */
export function isNitteFacultyEmail(email: string): boolean {
  return email.toLowerCase().trim().endsWith("@nitte.edu.in");
}

/**
 * Specifically allowed external email addresses permitted to log in.
 */
export const ALLOWED_EXTERNAL_EMAILS = new Set([
  "samarthpai9870@gmail.com",
  "sanidhyadatt26@gmail.com",
  "buggykurrrie610@gmail.com",
]);

/**
 * Checks whether an email address is allowed to sign in / sign up:
 * - @nmamit.in (students)
 * - @nitte.edu.in (faculties)
 * - Explicitly allowed external emails
 */
export function isAllowedEmail(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return (
    isNmamitEmail(normalized) ||
    isNitteFacultyEmail(normalized) ||
    ALLOWED_EXTERNAL_EMAILS.has(normalized)
  );
}

/**
 * Checks if the email belongs to an AIML student.
 */
export function isAimlStudent(email: string): boolean {
  const parsed = parseNmamitEmail(email);
  return parsed?.isAiml ?? false;
}

/**
 * Checks if the student is eligible for the coding marathon (2nd or 3rd year AIML).
 */
export function isMarathonEligible(email: string): boolean {
  const parsed = parseNmamitEmail(email);
  if (!parsed) return false;
  return parsed.isAiml && (parsed.currentYear === 2 || parsed.currentYear === 3);
}

