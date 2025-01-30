'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PlayerWithStats } from '@/types/player';
import { PlayerTable, columns } from '@/components/PlayerTable';
import type { ColumnKey } from '@/components/PlayerTable';
import { debounce } from 'lodash';

export default function PlayersPage() {
  const PLAYERS_PER_PAGE = 20;
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPlayersWithoutStats, setShowPlayersWithoutStats] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortColumn, setSortColumn] = useState<ColumnKey>('fpts');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const loadingRef = useRef<HTMLDivElement>(null);

  const fetchPlayers = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const normalizedSearch = search?.trim().toLowerCase();
      const offset = page * PLAYERS_PER_PAGE;
      
      if (normalizedSearch) {
        // Search by name
        const response = await supabase
          .from('players')
          .select('*')
          .or(`first_name.ilike.%${normalizedSearch}%,last_name.ilike.%${normalizedSearch}%`)
          .range(offset, offset + PLAYERS_PER_PAGE + 4);

        if (response.error) throw response.error;
        if (response.data) {
          const playersWithStats = await fetchPlayerStats(response.data);
          setPlayers(prev => {
            if (page === 0) return playersWithStats;
            const existingIds = new Set(prev.map(p => p.id));
            const newPlayers = playersWithStats.filter(p => !existingIds.has(p.id));
            return [...prev, ...newPlayers];
          });
          setHasMore(response.data.length === PLAYERS_PER_PAGE);
          setError(null);
        }
      } else {
        // Get players sorted by selected column
        const column = columns.find(col => col.key === sortColumn);
        // Determine if it's a text column based on the column key
        const isTextColumn = column?.key === 'last_name' || 
                           column?.key === 'position' || 
                           column?.key === 'team_id' || 
                           column?.key === 'first_name';

        if (isTextColumn) {
          // Handle text-based sorting at the database level
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('*')
            .order(sortColumn, { ascending: sortDirection === 'asc' })
            .range(offset, offset + PLAYERS_PER_PAGE - 1);

          if (playersError) throw playersError;
          if (playersData) {
            const playersWithStats = await fetchPlayerStats(playersData);
            setPlayers(prev => {
              if (page === 0) return playersWithStats;
              const existingIds = new Set(prev.map(p => p.id));
              const newPlayers = playersWithStats.filter(p => !existingIds.has(p.id));
              return [...prev, ...newPlayers];
            });
            setHasMore(playersData.length === PLAYERS_PER_PAGE);
            setError(null);
          }
        } else {
          // Handle numeric stats-based sorting
          if (sortColumn === 'fpts' || sortColumn === 'minutes') {
            // First, get all player IDs in the correct order
            const { data: allStatsData, error: statsError } = await supabase
              .from('player_stats')
              .select('player_id, pts, fg3m, reb, ast, stl, blk, turnover, minutes');

            if (statsError) throw statsError;
            if (!allStatsData?.length) {
              setHasMore(false);
              return;
            }

            // Sort all stats and get ordered IDs
            const orderedPlayerIds = allStatsData
              .map(stat => ({
                id: stat.player_id,
                value: sortColumn === 'fpts'
                  ? stat.pts +
                    (stat.fg3m || 0) * 0.5 +
                    stat.reb * 1.25 +
                    stat.ast * 1.5 +
                    stat.stl * 2 +
                    stat.blk * 2 -
                    (stat.turnover || 0) * 0.5
                  : (() => {
                      const [mins, secs] = (stat.minutes || '0:0').split(':').map(Number);
                      return mins * 60 + (secs || 0);
                    })()
              }))
              .sort((a, b) => sortDirection === 'asc' ? a.value - b.value : b.value - a.value)
              .map(item => item.id);

            // Get the paginated slice of player IDs
            const paginatedIds = orderedPlayerIds.slice(offset, offset + PLAYERS_PER_PAGE);

            // Fetch the players for this page
            const { data: playersData, error: playersError } = await supabase
              .from('players')
              .select('*')
              .in('id', paginatedIds);

            if (playersError) throw playersError;
            if (playersData) {
              // Sort players to match the stats order
              const sortedPlayers = paginatedIds
                .map(id => playersData.find(p => p.id === id))
                .filter((p): p is NonNullable<typeof p> => p != null);

              const playersWithStats = await fetchPlayerStats(sortedPlayers);
              setPlayers(prev => {
                if (page === 0) return playersWithStats;
                const existingIds = new Set(prev.map(p => p.id));
                const newPlayers = playersWithStats.filter(p => !existingIds.has(p.id));
                return [...prev, ...newPlayers];
              });
              setHasMore(offset + PLAYERS_PER_PAGE < orderedPlayerIds.length);
              setError(null);
            }
          } else {
            // Handle other numeric stats normally
            const { data: statsData, error: statsError } = await supabase
              .from('player_stats')
              .select('player_id')
              .order(sortColumn, { ascending: sortDirection === 'asc' })
              .range(offset, offset + PLAYERS_PER_PAGE - 1);

            if (statsError) throw statsError;
            if (!statsData?.length) {
              setHasMore(false);
              return;
            }

            const playerIds = statsData.map(stat => stat.player_id);
            const { data: playersData, error: playersError } = await supabase
              .from('players')
              .select('*')
              .in('id', playerIds);

            if (playersError) throw playersError;
            if (playersData) {
              const playersWithStats = await fetchPlayerStats(playersData);
              setPlayers(prev => {
                if (page === 0) return playersWithStats;
                const existingIds = new Set(prev.map(p => p.id));
                const newPlayers = playersWithStats.filter(p => !existingIds.has(p.id));
                return [...prev, ...newPlayers];
              });
              setHasMore(statsData.length === PLAYERS_PER_PAGE);
              setError(null);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in component:', error);
      setError('Failed to fetch players. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, sortColumn, sortDirection]);

  // Create a debounced version of fetchPlayers
  const debouncedFetch = useCallback(
    debounce((search: string) => {
      setPage(0); // Reset page when searching
      fetchPlayers(search);
    }, 500),
    [fetchPlayers]
  );

  // Create intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !searchTerm) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, searchTerm]);

  // Update search term and trigger debounced fetch
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFetch(value);
  };

  const handleSortChange = (column: ColumnKey, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    setPage(0); // Reset to first page
    setPlayers([]); // Clear current players
  };

  const fetchPlayerStats = async (players: PlayerWithStats[]) => {
    const playersWithStats = await Promise.all(
      players.map(async (player) => {
        try {
          // Get player stats - remove single() to handle no stats case
          const statsResponse = await supabase
            .from('player_stats')
            .select('*')
            .eq('player_id', player.id)
            .order('season', { ascending: false })
            .limit(1);

          // Get team info
          const teamResponse = await supabase
            .from('teams')
            .select('*')
            .eq('id', player.team_id)
            .single();

          return {
            ...player,
            team: teamResponse.data || player.team,
            stats: statsResponse.data?.[0] || undefined
          } as PlayerWithStats;
        } catch (error) {
          console.error(`Error fetching data for player ${player.id}:`, error);
          return { ...player, stats: undefined } as PlayerWithStats;
        }
      })
    );
    return playersWithStats;
  };

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers, page]);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] p-8">
      <div className="flex-none mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Players</h1>
        <p className="text-gray-500 dark:text-gray-400">Search and view NBA player statistics</p>
      </div>

      <div className="flex-none flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search players..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showPlayersWithoutStats"
            checked={showPlayersWithoutStats}
            onChange={(e) => setShowPlayersWithoutStats(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="showPlayersWithoutStats"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Show players without stats
          </label>
        </div>
      </div>

      {error ? (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : players.length === 0 && !loading ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No players found. Try a different search term.</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <PlayerTable 
            players={players} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow"
            showPlayersWithoutStats={showPlayersWithoutStats}
            onSortChange={handleSortChange}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
          <div ref={loadingRef} className="mt-4 pb-4">
            {loading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 