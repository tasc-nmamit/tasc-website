export interface HackerRankUser {
  rank: number;
  hacker: string;
  score: number;
  time_taken: number;
}

export async function fetchHackerRankLeaderboard(
  contestSlug: string,
  cookieString: string
): Promise<HackerRankUser[]> {
  const baseUrl = `https://www.hackerrank.com/rest/contests/${contestSlug}/leaderboard`;
  const limit = 200;
  let offset = 0;
  let allUsers: HackerRankUser[] = [];

  const headers = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Cookie": cookieString,
  };

  while (true) {
    const url = `${baseUrl}?offset=${offset}&limit=${limit}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("HackerRank 403 Forbidden: Your cookie might be expired or invalid.");
      }
      throw new Error(`HackerRank API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const models = data.models || [];

    if (models.length === 0) {
      break;
    }

    allUsers = allUsers.concat(
      models.map((user: any) => ({
        rank: user.rank,
        hacker: user.hacker,
        score: user.score,
        time_taken: user.time_taken,
      }))
    );

    offset += limit;

    // Slight delay to avoid aggressive rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return allUsers;
}
