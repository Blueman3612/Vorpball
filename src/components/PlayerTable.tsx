import { PlayerWithStats } from '@/types/player';
import { getPlayerImageUrl } from '@/lib/utils';
import { ReactNode } from 'react';
import Image from 'next/image';

interface PlayerTableProps {
  players: PlayerWithStats[];
  className?: string;
  showPlayersWithoutStats?: boolean;
  onSortChange?: (column: ColumnKey, direction: 'asc' | 'desc') => void;
  sortColumn: ColumnKey;
  sortDirection: 'asc' | 'desc';
}

export type ColumnKey = keyof PlayerWithStats | 'minutes' | 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'fg_pct' | 'fg3_pct' | 'ft_pct' | 'fpts' | 'rank';

export interface Column {
  key: ColumnKey;
  label: string;
  width?: string;
  getValue?: (player: PlayerWithStats, index?: number) => string | number | ReactNode;
  getSortValue?: (player: PlayerWithStats) => string | number;
  isSpecial?: boolean;
}

const formatMinutes = (minutes: string): number => {
  const [mins, secs] = minutes.split(':').map(Number);
  return mins + (secs / 60);
};

const getTeamAbbreviation = (team?: { city: string; name: string }) => {
  if (!team) return '-';
  // Common NBA city abbreviations
  const cityAbbreviations: { [key: string]: string } = {
    'Golden State': 'GSW',
    'Los Angeles': 'LAL', // Will be overridden for Clippers
    'New Orleans': 'NOP',
    'New York': 'NYK',
    'Oklahoma City': 'OKC',
    'Portland': 'POR',
    'San Antonio': 'SAS',
    'Phoenix': 'PHX',
    'Sacramento': 'SAC',
    'Milwaukee': 'MIL',
    'Minnesota': 'MIN',
    'Memphis': 'MEM',
    'Miami': 'MIA',
    'Detroit': 'DET',
    'Denver': 'DEN',
    'Dallas': 'DAL',
    'Cleveland': 'CLE',
    'Chicago': 'CHI',
    'Charlotte': 'CHA',
    'Brooklyn': 'BKN',
    'Boston': 'BOS',
    'Atlanta': 'ATL',
    'Washington': 'WAS',
    'Utah': 'UTA',
    'Toronto': 'TOR',
    'Philadelphia': 'PHI',
    'Orlando': 'ORL',
    'Indiana': 'IND',
    'Houston': 'HOU',
  };

  // Special cases
  if (team.city === 'Los Angeles' && team.name === 'Clippers') return 'LAC';
  
  return cityAbbreviations[team.city] || team.city.substring(0, 3).toUpperCase();
};

const calculateFantasyPoints = (player: PlayerWithStats): number => {
  if (!player.stats) return 0;
  
  return (
    player.stats.pts +
    (player.stats.fg3m || 0) * 0.5 +
    player.stats.reb * 1.25 +
    player.stats.ast * 1.5 +
    player.stats.stl * 2 +
    player.stats.blk * 2 -
    (player.stats.turnover || 0) * 0.5
  );
};

export const columns: Column[] = [
  { 
    key: 'rank',
    label: '#',
    width: '30px',
    getValue: (_, index = 0) => (index + 1).toString()
  },
  { 
    key: 'last_name', 
    label: 'PLAYER', 
    width: '200px', 
    getValue: (player) => (
      <div className="flex items-center gap-3 relative h-8">
        <div className="absolute bottom-[-8px] w-8 h-6 scale-150 origin-bottom">
          <Image
            src={getPlayerImageUrl(player.first_name, player.last_name, player.id, player.profile_picture_url)}
            alt={`${player.first_name} ${player.last_name}`}
            className="w-full h-full object-contain"
            width={32}
            height={24}
          />
        </div>
        <span className="pl-11">{`${player.first_name} ${player.last_name}`}</span>
      </div>
    ),
    getSortValue: (player) => player.last_name.toLowerCase()
  },
  { key: 'position', label: 'POS', width: '40px' },
  { 
    key: 'team_id', 
    label: 'TEAM', 
    width: '30px', 
    getValue: (player) => getTeamAbbreviation(player.team),
    getSortValue: (player) => player.team?.city || ''
  },
  {
    key: 'fpts',
    label: 'FPTS',
    width: '40px',
    getValue: (player) => player.stats ? calculateFantasyPoints(player).toFixed(1) : '-',
    getSortValue: (player) => player.stats ? calculateFantasyPoints(player) : -1,
    isSpecial: true
  },
  { 
    key: 'minutes', 
    label: 'MIN', 
    getValue: (player) => {
      if (!player.stats?.minutes) return '-';
      return formatMinutes(player.stats.minutes).toFixed(1);
    },
    getSortValue: (player) => player.stats?.minutes ? formatMinutes(player.stats.minutes) : -1
  },
  { 
    key: 'pts', 
    label: 'PTS', 
    getValue: (player) => player.stats?.pts?.toFixed(1) || '-',
    getSortValue: (player) => player.stats?.pts ?? -1
  },
  { 
    key: 'reb', 
    label: 'REB', 
    getValue: (player) => player.stats?.reb?.toFixed(1) || '-',
    getSortValue: (player) => player.stats?.reb ?? -1
  },
  { 
    key: 'ast', 
    label: 'AST', 
    getValue: (player) => player.stats?.ast?.toFixed(1) || '-',
    getSortValue: (player) => player.stats?.ast ?? -1
  },
  { 
    key: 'stl', 
    label: 'STL', 
    getValue: (player) => player.stats?.stl?.toFixed(1) || '-',
    getSortValue: (player) => player.stats?.stl ?? -1
  },
  { 
    key: 'blk', 
    label: 'BLK', 
    getValue: (player) => player.stats?.blk?.toFixed(1) || '-',
    getSortValue: (player) => player.stats?.blk ?? -1
  },
  { 
    key: 'fg_pct', 
    label: 'FG%', 
    getValue: (player) => player.stats?.fg_pct ? `${(player.stats.fg_pct * 100).toFixed(1)}%` : '-',
    getSortValue: (player) => player.stats?.fg_pct ?? -1
  },
  { 
    key: 'fg3_pct', 
    label: '3P%', 
    getValue: (player) => player.stats?.fg3_pct ? `${(player.stats.fg3_pct * 100).toFixed(1)}%` : '-',
    getSortValue: (player) => player.stats?.fg3_pct ?? -1
  },
  { 
    key: 'ft_pct', 
    label: 'FT%', 
    getValue: (player) => player.stats?.ft_pct ? `${(player.stats.ft_pct * 100).toFixed(1)}%` : '-',
    getSortValue: (player) => player.stats?.ft_pct ?? -1
  },
];

export function PlayerTable({ 
  players, 
  className = '', 
  showPlayersWithoutStats = false, 
  onSortChange,
  sortColumn,
  sortDirection 
}: PlayerTableProps) {
  const handleSort = (columnKey: ColumnKey) => {
    if (!onSortChange) return;
    
    const newDirection = sortColumn === columnKey 
      ? (sortDirection === 'asc' ? 'desc' : 'asc')
      : (columnKey === 'last_name' || columnKey === 'position' || columnKey === 'team_id' ? 'asc' : 'desc');

    onSortChange(columnKey, newDirection);
  };

  const filteredPlayers = showPlayersWithoutStats 
    ? players 
    : players.filter(player => player.stats);

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    const column = columns.find(col => col.key === sortColumn);
    if (!column) return 0;

    // Always use getSortValue for sorting if available
    if (column.getSortValue) {
      const aValue = column.getSortValue(a);
      const bValue = column.getSortValue(b);

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    }

    // Fallback to direct property access if no getSortValue
    const aValue = String(a[column.key as keyof PlayerWithStats] || '-').toLowerCase();
    const bValue = String(b[column.key as keyof PlayerWithStats] || '-').toLowerCase();

    if (aValue === '-' && bValue !== '-') return 1;
    if (aValue !== '-' && bValue === '-') return -1;
    if (aValue === '-' && bValue === '-') return 0;

    return sortDirection === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  return (
    <div className={className}>
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
          <tr>
            {columns.map((column, colIndex) => (
              <th
                key={String(column.key)}
                className={`
                  px-4 py-2 
                  text-left font-semibold 
                  ${column.key === 'rank' ? '' : 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700'}
                  border-b border-r border-gray-200 dark:border-gray-700
                  ${colIndex === 0 ? 'rounded-tl-lg' : ''}
                  ${colIndex === columns.length - 1 ? 'rounded-tr-lg border-r-0' : ''}
                  ${column.width ? `w-[${column.width}]` : ''}
                  ${column.isSpecial 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-600 dark:text-gray-300'
                  }
                `}
                onClick={() => column.key !== 'rank' && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {sortColumn === column.key && (
                    <span className="text-xs">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr
              key={player.id}
              className={`
                hover:bg-blue-50 dark:hover:bg-blue-900/20
                transition-colors duration-150
                ${index % 2 === 1 ? '' : 'bg-gray-50/50 dark:bg-gray-700/50'}
                ${index === sortedPlayers.length - 1 ? 'last-row' : ''}
              `}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={`${player.id}-${String(column.key)}`}
                  className={`
                    px-4 py-2 
                    whitespace-nowrap
                    border-b border-r border-gray-200 dark:border-gray-700
                    ${colIndex === columns.length - 1 ? 'border-r-0' : ''}
                    ${index === sortedPlayers.length - 1 ? 'border-b-0' : ''}
                    ${index === sortedPlayers.length - 1 && colIndex === 0 ? 'rounded-bl-lg' : ''}
                    ${index === sortedPlayers.length - 1 && colIndex === columns.length - 1 ? 'rounded-br-lg' : ''}
                    ${column.isSpecial 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' 
                      : 'text-gray-900 dark:text-gray-100'
                    }
                  `}
                >
                  {column.getValue ? column.getValue(player, index) : String(player[column.key as keyof PlayerWithStats] || '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}