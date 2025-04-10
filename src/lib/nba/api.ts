const NBA_API_BASE = 'https://stats.nba.com/stats';

// Utility function to convert non-English characters to English equivalents
function normalizeName(name: string): string {
  return name.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export async function getNBAPlayerID(firstName: string, lastName: string): Promise<number | null> {
  try {
    const response = await fetch(
      `${NBA_API_BASE}/commonallplayers?LeagueID=00&Season=2024-25&IsOnlyCurrentSeason=1`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.nba.com/',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      }
    );

    if (!response.ok) {
      console.error('NBA API Error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const players = data.resultSets[0].rowSet;
    
    // Normalize input names
    const normalizedFirstName = normalizeName(firstName);
    const normalizedLastName = normalizeName(lastName);
    
    // Find player by name
    const player = players.find((player: [number, string, ...unknown[]]) => {
      const [, playerName] = player;
      const [playerLastName, playerFirstName] = playerName.split(', ');
      return normalizeName(playerFirstName.toLowerCase()) === normalizedFirstName.toLowerCase() && 
             normalizeName(playerLastName.toLowerCase()) === normalizedLastName.toLowerCase();
    });

    if (player) {
      return player[0]; // The first element is the NBA player ID
    }

    return null;
  } catch (error) {
    console.error('Error fetching NBA player ID:', error);
    return null;
  }
} 