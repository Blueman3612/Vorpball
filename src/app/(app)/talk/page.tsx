'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { ChatInterface } from '@/components/chat/ChatInterface';

interface League {
  id: string;
  name: string;
  created_at: string;
}

interface LeagueMemberResponse {
  league: {
    id: string;
    name: string;
    created_at: string;
  };
}

export default function TalkPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeagues() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('You must be logged in to view leagues.');
          return;
        }

        const { data, error: leaguesError } = await supabase
          .from('league_members')
          .select(`
            league:leagues (
              id,
              name,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { foreignTable: 'leagues', ascending: false });

        if (leaguesError) throw leaguesError;

        // Transform the data to get the leagues array with proper typing
        const leaguesData = data ? (data as LeagueMemberResponse[]).map(item => item.league) : [];
        setLeagues(leaguesData);
        
        // Select the first league by default if we have leagues and none is selected
        if (leaguesData.length > 0 && !selectedLeague) {
          setSelectedLeague(leaguesData[0].id);
        }
      } catch (err) {
        console.error('Error fetching leagues:', err);
        setError('Failed to load leagues.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeagues();
  }, [selectedLeague]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-theme(spacing.14))] p-4">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading leagues...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-theme(spacing.14))] p-4">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-error-500 mb-2">
              <svg className="h-8 w-8 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (leagues.length === 0) {
    return (
      <div className="h-[calc(100vh-theme(spacing.14))] p-4">
        <div className="h-full flex items-center justify-center">
          <Card className="p-6 text-center max-w-md w-full">
            <p className="text-gray-600 dark:text-gray-400">You are not a member of any leagues yet.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] p-4">
      {/* Leagues Sidebar - Discord style */}
      <div className="w-[72px] flex-shrink-0">
        <div className="py-2">
          <div className="space-y-2 px-2">
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className="group relative w-full"
              >
                {/* League Icon */}
                <div className={cn(
                  'w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all duration-200',
                  'flex items-center justify-center',
                  selectedLeague === league.id
                    ? 'bg-primary-100/10 dark:bg-primary-900/20 ring-2 ring-primary-500'
                    : 'bg-gray-100/10 dark:bg-gray-800/20 hover:bg-gray-200/20 dark:hover:bg-gray-700/30'
                )}>
                  <span className={cn(
                    'font-medium text-lg transition-colors',
                    selectedLeague === league.id
                      ? 'text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {league.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* Hover tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 pointer-events-none z-50">
                  <div className={cn(
                    'bg-gray-900/90 text-white px-2 py-1 rounded text-sm whitespace-nowrap',
                    'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0',
                    'transition-all duration-200'
                  )}>
                    {league.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        {selectedLeague ? (
          <ChatInterface leagueId={selectedLeague} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Select a league to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
} 