export interface PlayerStats {
  games_played: number;
  minutes: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
  fg3m: number;
  turnover: number;
}

export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  team_id: number;
  team: {
    id: number;
    city: string;
    name: string;
  };
}

export interface PlayerWithStats extends Player {
  stats?: PlayerStats;
} 