import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LeagueCardProps {
  type: 'create' | 'info';
  league?: {
    id?: string;
    name: string;
    status: 'active' | 'draft' | 'completed';
    league: string;
    rank: string;
    record: string;
    nextGame?: string;
  };
}

export function LeagueCard({ type, league }: LeagueCardProps) {
  if (type === 'create') {
    return (
      <Link 
        href="/league/create"
        className={cn(
          'block h-[280px] p-6',
          'border-2 border-dashed border-gray-400 dark:border-gray-700',
          'rounded-xl',
          'transition-colors duration-200',
          'hover:border-primary-500 dark:hover:border-primary-500',
          'group'
        )}
      >
        <div className="h-full flex flex-col items-center justify-center">
          <div className={cn(
            'p-3 rounded-xl mb-4',
            'bg-gray-200 dark:bg-gray-800',
            'group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20',
            'transition-colors duration-200'
          )}>
            <svg 
              className={cn(
                'w-8 h-8',
                'text-gray-600 dark:text-gray-500',
                'group-hover:text-primary-500 dark:group-hover:text-primary-400',
                'transition-colors duration-200'
              )} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className={cn(
            'text-base font-medium',
            'text-gray-600 dark:text-gray-400',
            'group-hover:text-primary-500 dark:group-hover:text-primary-400',
            'transition-colors duration-200'
          )}>
            Create New League
          </span>
        </div>
      </Link>
    );
  }

  if (!league) return null;

  const statusColors = {
    active: 'text-success-500 bg-success-50 dark:bg-success-900/20',
    draft: 'text-warning-500 bg-warning-50 dark:bg-warning-900/20',
    completed: 'text-gray-500 bg-gray-50 dark:bg-gray-800'
  };

  const statusText = {
    active: 'Active',
    draft: 'Draft',
    completed: 'Completed'
  };

  return (
    <Link 
      href={`/league/${league.id}`}
      className={cn(
        'block h-[280px] p-6',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-xl',
        'transition-all duration-200',
        'hover:border-primary-500 dark:hover:border-primary-500',
        'hover:shadow-md'
      )}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {league.name}
          </h3>
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            statusColors[league.status]
          )}>
            {statusText[league.status]}
          </span>
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">League</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{league.league}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rank</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{league.rank}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Record</p>
            <p className="text-base font-medium text-gray-900 dark:text-white">{league.record}</p>
          </div>
        </div>

        {league.nextGame && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Next game in {league.nextGame}</p>
          </div>
        )}
      </div>
    </Link>
  );
} 