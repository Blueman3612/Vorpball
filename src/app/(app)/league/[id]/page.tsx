'use client';

import { Tabs, type Tab } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { addToast } from '@/components/ui/toast';
import { ChatInterface } from '@/components/chat/ChatInterface';

// Dashboard Tab Component
function DashboardTab() {
  const { t } = useTranslations();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('common.sections.leagueStandings')}</h3>
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('common.sections.recentActivity')}</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('common.sections.leagueCalendar')}</h3>
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
  const { t } = useTranslations();
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('common.sections.myRoster')}</h3>
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
  const { t } = useTranslations();
  const [teams, setTeams] = useState([
    { id: 'user', name: 'Your Team' }
  ]);
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  const handleAddTeam = () => {
    setIsAddingTeam(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{t('common.sections.createTrade')}</h3>
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
            {t('common.actions.addTeamToTrade')}
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

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {t('common.sections.selectPlayersToTrade')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                  >
                    {t('common.actions.addPlayer')}
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
              {t('common.actions.proposeTrade')}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">{t('common.sections.pendingTrades')}</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('common.sections.noPendingTrades')}
        </div>
      </Card>
    </div>
  );
}

// Talk Tab Component
function TalkTab() {
  const { id: leagueId } = useParams();
  
  return (
    <div className="h-[calc(100vh-12rem)]">
      <ChatInterface leagueId={leagueId as string} />
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  const { t } = useTranslations();
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">{t('common.sections.leagueSettings')}</h3>
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
  const { id: leagueId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user has access to this league
  useEffect(() => {
    async function checkAccess() {
      try {
        setIsLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('You must be logged in to view leagues.');
          return;
        }

        // Try to fetch the league - RLS will prevent access if user is not a member
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select('id, name')
          .eq('id', leagueId)
          .single();

        if (leagueError || !leagueData) {
          setError('You do not have access to this league.');
          return;
        }

        // Check if user is admin
        const { data: memberData, error: memberError } = await supabase
          .from('league_members')
          .select('role')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .single();

        if (!memberError && memberData) {
          setIsAdmin(memberData.role === 'admin');
        }

        setError(null);
      } catch (err) {
        console.error('Error checking league access:', err);
        setError('An error occurred while checking league access.');
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [leagueId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('common.states.loadingLeague')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="text-error-500 mb-2">
            <svg className="h-8 w-8 mx-auto" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }
  
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
      <div className="relative">
        {isAdmin && (
          <div className="absolute right-0 -top-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const { data, error } = await supabase
                    .from('league_invites')
                    .insert({
                      league_id: leagueId
                    })
                    .select('code')
                    .single();

                  if (error) throw error;

                  await navigator.clipboard.writeText(data.code);
                  addToast(t('common.success.inviteCopied'), 'success');
                } catch (error) {
                  console.error('Error generating invite:', error);
                  addToast(t('common.errors.inviteGenerationFailed'), 'error');
                }
              }}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2 1 1 0 000-2zM18 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('common.actions.inviteMember')}
            </Button>
          </div>
        )}

        <Tabs tabs={tabs} variant="default" />
      </div>
    </div>
  );
} 