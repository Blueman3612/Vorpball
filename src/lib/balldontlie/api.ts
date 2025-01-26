import axios from 'axios';

const API_BASE_URL = 'https://api.balldontlie.io/v1';
const API_KEY = process.env.NEXT_PUBLIC_BALLDONTLIE_API_KEY;
const CURRENT_SEASON = 2024; // 2024-25 season

console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': API_KEY
  },
});

// Add response interceptor for rate limiting
api.interceptors.response.use(
  response => response,
  async error => {
    console.log('API Error Details:', {
      status: error.response?.status,
      message: error.message,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
      }
    });

    if (error.response?.status === 429) {
      // Rate limited - wait for a moment and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  team: {
    id: number;
    name: string;
    city: string;
  };
}

export interface PlayerStats {
  games_played: number;
  season: number;
  min: string;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  pf: number;
  pts: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
}

export const getPlayers = async (page = 1, per_page = 25) => {
  try {
    console.log('Fetching players...');
    const response = await api.get(`/players?page=${page}&per_page=${per_page}`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    return { data: [] };
  }
};

export const getPlayerStats = async (playerId: number, season = CURRENT_SEASON) => {
  try {
    const response = await api.get(`/season_averages?season=${season}&player_id=${playerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return { data: [] };
  }
};

export const searchPlayers = async (searchTerm: string) => {
  try {
    console.log('Searching players with term:', searchTerm);
    // Take the first word of the search term (usually first name)
    const searchWords = searchTerm.trim().split(' ');
    const firstWord = searchWords[0];
    // Encode just the first word for better results
    const encodedSearch = encodeURIComponent(firstWord);
    const response = await api.get(`/players?search=${encodedSearch}&per_page=100`);
    
    // If there are multiple words, filter results client-side to match full name
    let players = response.data.data;
    if (searchWords.length > 1) {
      const fullNameLower = searchTerm.toLowerCase();
      players = players.filter((player: Player) => 
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(fullNameLower)
      );
    }
    
    return {
      data: players,
      meta: response.data.meta
    };
  } catch (error) {
    console.error('Error searching players:', error);
    return { data: [] };
  }
}; 