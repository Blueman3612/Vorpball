import { supabase } from './client';
import { getPlayers, getPlayerStats, Player, PlayerStats } from '../balldontlie/api';

// Track the current sync process
let currentAbortController: AbortController | null = null;

export function stopSync() {
  if (currentAbortController) {
    console.log('Stopping sync process...');
    currentAbortController.abort();
    currentAbortController = null;
  }
}

export async function syncTeam(team: Player['team']) {
  console.log(`Syncing team: ${team.city} ${team.name} (ID: ${team.id})`);
  const { data, error } = await supabase
    .from('teams')
    .upsert({
      id: team.id,
      name: team.name,
      city: team.city,
    }, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Error syncing team:', error);
    throw error;
  }

  return data;
}

export async function syncPlayer(player: Player, signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('Sync aborted');

  console.log(`Syncing player: ${player.first_name} ${player.last_name} (ID: ${player.id})`);
  
  const { data, error } = await supabase
    .from('players')
    .upsert({
      id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      position: player.position,
      team_id: player.team.id,
      height: player.height,
      weight: player.weight,
      jersey_number: player.jersey_number,
      college: player.college,
      country: player.country,
      draft_year: player.draft_year,
      draft_round: player.draft_round,
      draft_number: player.draft_number,
    }, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Error syncing player:', error);
    throw error;
  }

  return data;
}

export async function syncPlayerStats(playerId: number, stats: PlayerStats, signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('Sync aborted');

  console.log(`Syncing stats for player ID ${playerId} (Season: ${stats.season})`);
  const { data, error } = await supabase
    .from('player_stats')
    .upsert({
      player_id: playerId,
      season: stats.season,
      games_played: stats.games_played,
      minutes: stats.min,
      fgm: stats.fgm,
      fga: stats.fga,
      fg3m: stats.fg3m,
      fg3a: stats.fg3a,
      ftm: stats.ftm,
      fta: stats.fta,
      oreb: stats.oreb,
      dreb: stats.dreb,
      reb: stats.reb,
      ast: stats.ast,
      stl: stats.stl,
      blk: stats.blk,
      turnover: stats.turnover,
      pf: stats.pf,
      pts: stats.pts,
      fg_pct: stats.fg_pct,
      fg3_pct: stats.fg3_pct,
      ft_pct: stats.ft_pct,
    }, {
      onConflict: 'player_id,season'
    });

  if (error) {
    console.error('Error syncing player stats:', error);
    throw error;
  }

  return data;
}

// New function to get all teams from all active players
async function getAllTeams(signal?: AbortSignal) {
  console.log('Fetching all teams from active players...');
  const teams = new Map();
  let cursor = undefined;
  
  while (true) {
    if (signal?.aborted) throw new Error('Sync aborted');
    
    const players = await getPlayers(cursor, undefined, signal);
    if (!players.data || players.data.length === 0) break;
    
    // Collect unique teams
    players.data.forEach((player: Player) => {
      if (!teams.has(player.team.id)) {
        teams.set(player.team.id, player.team);
      }
    });
    
    if (!players.meta?.next_cursor) break;
    cursor = parseInt(players.meta.next_cursor);
    
    // Add a small delay to avoid rate limiting
    if (!signal?.aborted) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return Array.from(teams.values());
}

// Updated function to sync all teams first
async function syncAllTeams(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error('Sync aborted');
  
  console.log('Starting team sync...');
  const teams = await getAllTeams(signal);
  console.log(`Found ${teams.length} unique teams from active players`);
  
  // Sync all teams
  for (const team of teams) {
    if (signal?.aborted) throw new Error('Sync aborted');
    await syncTeam(team);
  }
  
  console.log('Team sync complete');
}

export async function syncAllPlayers(cursor?: string, perPage = 25) {
  // Create new abort controller for this sync process
  if (!currentAbortController) {
    currentAbortController = new AbortController();
  }
  const { signal } = currentAbortController;

  try {
    // If this is the first batch (no cursor), sync all teams first
    if (!cursor) {
      await syncAllTeams(signal);
    }

    if (signal.aborted) throw new Error('Sync aborted');

    console.log(`Starting sync with cursor: ${cursor || 'initial'} (${perPage} players per page)`);
    const players = await getPlayers(cursor ? parseInt(cursor) : undefined, perPage, signal);
    
    if (!players.data || players.data.length === 0) {
      console.log('No players found in this batch');
      return;
    }

    console.log(`Found ${players.data.length} players in batch starting at cursor ${cursor || 'initial'}`);
    
    let syncedCount = 0;
    for (const player of players.data) {
      if (signal.aborted) throw new Error('Sync aborted');

      try {
        await syncPlayer(player, signal);
        
        // Get and sync player stats
        const statsResponse = await getPlayerStats(player.id);
        if (statsResponse.data && statsResponse.data[0]) {
          await syncPlayerStats(player.id, statsResponse.data[0], signal);
        }
        syncedCount++;
      } catch (error) {
        if (error instanceof Error && error.message === 'Sync aborted') {
          throw error;
        }
        console.error(`Error processing player ${player.first_name} ${player.last_name}:`, error);
        continue;
      }
    }

    console.log(`Successfully synced ${syncedCount} players from this batch`);

    // Handle cursor-based pagination
    if (!signal.aborted && players.meta?.next_cursor) {
      console.log(`Moving to next batch with cursor: ${players.meta.next_cursor}`);
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      await syncAllPlayers(players.meta.next_cursor.toString(), perPage);
    } else if (!signal.aborted) {
      console.log('Sync complete! No more players to process.');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Sync aborted') {
      console.log('Sync process was stopped.');
      return; // Exit early on abort
    } else {
      throw error;
    }
  } finally {
    if (signal.aborted) {
      currentAbortController = null;
    }
  }
} 