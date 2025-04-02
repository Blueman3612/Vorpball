import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LeagueCardProps {
  type: 'create' | 'info';
  league?: {
    id: string;
    name: string;
    scoring_type: 'category' | 'points' | 'both';
    num_teams: number;
    draft_type: 'snake' | 'auction' | 'linear';
    draft_date: string | null;
    status?: 'active' | 'draft' | 'completed';
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
          <p className="text-gray-600 dark:text-gray-400 text-center group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200">
            Create New League
          </p>
        </div>
      </Link>
    );
  }

  if (!league) return null;

  return (
    <Link 
      href={`/league/${league.id}`}
      className={cn(
        'block h-[280px] p-6',
        'border border-gray-200 dark:border-gray-800',
        'rounded-xl',
        'transition-all duration-200',
        'hover:border-primary-500 dark:hover:border-primary-500',
        'hover:shadow-lg',
        'bg-white dark:bg-gray-900'
      )}
    >
      <div className="h-full flex flex-col">
        <h3 className="text-xl font-semibold mb-2">{league.name}</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>Format: {league.scoring_type.charAt(0).toUpperCase() + league.scoring_type.slice(1)}</p>
          <p>Teams: {league.num_teams}</p>
          <p>Draft: {league.draft_type.charAt(0).toUpperCase() + league.draft_type.slice(1)}</p>
          {league.draft_date && (
            <p>Draft Date: {new Date(league.draft_date).toLocaleDateString()}</p>
          )}
          <p className="mt-4">
            Status: <span className="capitalize">{league.status || 'draft'}</span>
          </p>
        </div>
      </div>
    </Link>
  );
} 