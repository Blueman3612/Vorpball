'use client';

import { Tabs, type Tab } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

// Dashboard Tab Component
function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">League Standings</h3>
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">League Calendar</h3>
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </Card>
      </div>
    </div>
  );
}

// Matchup Tab Component
function MatchupTab() {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/3">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="mt-4 h-6 w-2/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="text-2xl font-bold">VS</div>
        <div className="w-1/3">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="mt-4 h-6 w-2/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    </Card>
  );
}

// Team Tab Component
function TeamTab() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">My Roster</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-1/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                <div className="mt-2 h-3 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Trades Tab Component
function TradesTab() {
  const [teams, setTeams] = useState([
    { id: 'user', name: 'Your Team' } // Start with user's team
  ]);
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  const handleAddTeam = () => {
    setIsAddingTeam(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Create Trade</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTeam}
            disabled={teams.length >= 4 || isAddingTeam}
            className="flex items-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Team to Trade
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div 
              key={team.id}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200" />
              <div className="relative p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">{team.name}</h4>
                  {team.id !== 'user' && (
                    <button
                      onClick={() => setTeams(teams.filter(t => t.id !== team.id))}
                      className="text-gray-400 hover:text-error-500 dark:text-gray-500 dark:hover:text-error-500 transition-colors"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Placeholder for player selection */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Select players to trade
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                  >
                    Add Player
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {teams.length > 1 && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="affirmative"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Propose Trade
            </Button>
          </div>
        )}
      </Card>

      {/* Pending Trades Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Pending Trades</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No pending trades
        </div>
      </Card>
    </div>
  );
}

// Talk Tab Component
function TalkTab() {
  const { id: leagueId } = useParams();
  const [channels, setChannels] = useState<any[]>([]);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch channels on mount
  useEffect(() => {
    async function fetchChannels() {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('You must be logged in to view channels.');
          return;
        }

        // First check if user is a member of the league
        const { data: memberData, error: memberError } = await supabase
          .from('league_members')
          .select('id')
          .match({ league_id: leagueId, user_id: user.id })
          .maybeSingle();

        if (memberError) {
          console.error('Error checking membership:', memberError);
          setError('Failed to verify league membership.');
          return;
        }

        if (!memberData) {
          setError('You are not a member of this league.');
          return;
        }

        // Then fetch channels
        const { data: channelsData, error: channelsError } = await supabase
          .from('league_channels')
          .select('*')
          .eq('league_id', leagueId)
          .order('position');

        if (channelsError) {
          console.error('Error fetching channels:', channelsError);
          setError('Failed to load channels. Please try again later.');
          return;
        }

        setError(null);
        setChannels(channelsData || []);
        if (channelsData && channelsData.length > 0 && !currentChannel) {
          setCurrentChannel(channelsData[0].id);
        }
      } catch (err) {
        console.error('Error in fetchChannels:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChannels();
  }, [leagueId, currentChannel]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="text-error-500 mb-2">
            <svg className="h-8 w-8 mx-auto" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Channels Sidebar */}
      <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Channels</h3>
        </div>
        <div className="overflow-y-auto h-full">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setCurrentChannel(channel.id)}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors',
                'flex items-center gap-2',
                channel.id === currentChannel
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              )}
            >
              {channel.type === 'announcement' ? (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
              )}
              # {channel.name}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Channel Header */}
        {currentChannel && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                # {channels.find(c => c.id === currentChannel)?.name}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {channels.find(c => c.id === currentChannel)?.description}
              </span>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Message placeholder */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No messages yet
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Send a message..."
              className={cn(
                'w-full px-4 py-2 bg-gray-100 dark:bg-gray-800',
                'rounded-lg border border-transparent',
                'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
                'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">League Settings</h3>
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <div className="h-5 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="mt-1 h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function LeaguePage() {
  const { t } = useTranslations();
  
  const tabs: Tab[] = [
    {
      id: 'dashboard',
      label: t('common.tabs.dashboard'),
      content: <DashboardTab />
    },
    {
      id: 'matchup',
      label: t('common.tabs.matchup'),
      content: <MatchupTab />
    },
    {
      id: 'team',
      label: t('common.tabs.team'),
      content: <TeamTab />
    },
    {
      id: 'trades',
      label: t('common.tabs.trades'),
      content: <TradesTab />
    },
    {
      id: 'talk',
      label: t('common.tabs.talk'),
      content: <TalkTab />
    },
    {
      id: 'settings',
      label: t('common.tabs.settings'),
      content: <SettingsTab />
    }
  ];

  return (
    <div className="mx-auto px-8 py-6">
      <Tabs tabs={tabs} variant="default" />
    </div>
  );
} 