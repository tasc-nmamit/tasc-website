/**
 * Utility functions for extracting and normalizing coding profiles and usernames.
 */

/**
 * Extracts a clean HackerRank username from a handle or URL.
 * Handles:
 * - 'johndoe' -> 'johndoe'
 * - '@johndoe' -> 'johndoe'
 * - 'https://www.hackerrank.com/profile/johndoe' -> 'johndoe'
 * - 'https://hackerrank.com/johndoe' -> 'johndoe'
 * - 'hackerrank.com/profile/johndoe/' -> 'johndoe'
 * - 'https://www.hackerrank.com/profile/johndoe?hr_r=1' -> 'johndoe'
 */
export function extractHackerRankUsername(val: string | undefined | null): string {
  if (!val) return "";
  let str = val.trim().replace(/^@+/, "");
  if (!str) return "";

  if (!str.includes("/") && !str.includes(".")) {
    return str;
  }

  try {
    const url = new URL(str.startsWith("http://") || str.startsWith("https://") ? str : `https://${str}`);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last || str;
  } catch {
    return str;
  }
}

/**
 * Normalizes a LeetCode handle or URL to the canonical format:
 * 'https://leetcode.com/u/{username}'
 */
export function normalizeLeetCode(val: string | undefined | null): string {
  if (!val) return "";
  let str = val.trim().replace(/^@+/, "");
  if (!str) return "";

  if (str.includes("/") || str.includes("leetcode.com")) {
    try {
      const url = new URL(str.startsWith("http://") || str.startsWith("https://") ? str : `https://${str}`);
      const parts = url.pathname.split("/").filter(Boolean);
      const username = parts[parts.length - 1];
      if (username && username !== "u") {
        return `https://leetcode.com/u/${username}`;
      }
    } catch {
      // fallback
    }
  }

  const clean = str.replace(/^@+/, "").replace(/^\/+/, "");
  return clean ? `https://leetcode.com/u/${clean}` : "";
}

/**
 * Normalizes a GitHub handle or URL to the canonical format:
 * 'https://github.com/{username}'
 */
export function normalizeGitHub(val: string | undefined | null): string {
  if (!val) return "";
  let str = val.trim().replace(/^@+/, "");
  if (!str) return "";

  if (str.includes("/") || str.includes("github.com")) {
    try {
      const url = new URL(str.startsWith("http://") || str.startsWith("https://") ? str : `https://${str}`);
      const parts = url.pathname.split("/").filter(Boolean);
      const username = parts[parts.length - 1];
      if (username) {
        return `https://github.com/${username}`;
      }
    } catch {
      // fallback
    }
  }

  const clean = str.replace(/^@+/, "").replace(/^\/+/, "");
  return clean ? `https://github.com/${clean}` : "";
}
