'use client';

import { useEffect, useState } from 'react';
import { Player, PlayerStats, getPlayers, searchPlayers, getPlayerStats } from '@/lib/balldontlie/api';

interface PlayerWithStats extends Player {
  stats?: PlayerStats;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlayerStats = async (players: Player[]) => {
    const playersWithStats = await Promise.all(
      players.map(async (player) => {
        try {
          const statsResponse = await getPlayerStats(player.id);
          const latestStats = statsResponse.data[0];
          return {
            ...player,
            stats: latestStats || undefined
          } as PlayerWithStats;
        } catch (error) {
          console.error(`Error fetching stats for player ${player.id}:`, error);
          return { ...player, stats: undefined } as PlayerWithStats;
        }
      })
    );
    return playersWithStats.filter(player => player.stats);
  };

  const fetchPlayers = async (search?: string) => {
    try {
      setLoading(true);
      const normalizedSearch = search?.trim().toLowerCase();
      const response = normalizedSearch 
        ? await searchPlayers(normalizedSearch)
        : await getPlayers(1, 25);

      if (response.data) {
        const activePlayers = await fetchPlayerStats(response.data);
        setPlayers(activePlayers);
        setError(null);
      } else {
        setError('No data received from API');
      }
    } catch (error) {
      console.error('Error in component:', error);
      setError('Failed to fetch players. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchPlayers(searchTerm);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Players</h1>
        <p className="text-gray-500 dark:text-gray-400">Search and view NBA player statistics</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search active players..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
          >
            Search
          </button>
        </div>
      </form>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No active players found. Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {player.first_name} {player.last_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{player.position}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {player.team.city} {player.team.name}
              </p>
              {player.stats && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="grid grid-cols-2 gap-x-4">
                    <p>PPG: {player.stats.pts.toFixed(1)}</p>
                    <p>RPG: {player.stats.reb.toFixed(1)}</p>
                    <p>APG: {player.stats.ast.toFixed(1)}</p>
                    <p>Games: {player.stats.games_played}</p>
                    <p>FG%: {(player.stats.fg_pct * 100).toFixed(1)}%</p>
                    <p>3P%: {(player.stats.fg3_pct * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 