'use client';

import { useEffect, useState } from 'react';
import { LeagueCard } from '@/components/ui/league-card';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { addToast } from '@/components/ui/toast';

interface League {
  id: string;
  name: string;
  scoring_type: 'category' | 'points' | 'both';
  num_teams: number;
  draft_type: 'snake' | 'auction' | 'linear';
  draft_date: string | null;
  status: 'active' | 'draft' | 'completed';
}

interface LeagueMemberResponse {
  league: League;
}

function transformLeagueForCard(league: League) {
  return {
    name: league.name,
    status: league.status,
    league: `${league.num_teams} Teams - ${league.scoring_type.charAt(0).toUpperCase() + league.scoring_type.slice(1)}`,
    rank: 'N/A', // TODO: Add rank calculation
    record: 'N/A', // TODO: Add record calculation
    nextGame: league.draft_date ? `Draft on ${new Date(league.draft_date).toLocaleDateString()}` : undefined
  };
}

export default function LeaguePage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeagues() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return;

      const { data, error } = await supabase
        .from('league_members')
        .select(`
          league:leagues (
            id,
            name,
            scoring_type,
            num_teams,
            draft_type,
            draft_date,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { foreignTable: 'leagues', ascending: false });

      if (error) throw error;
      
      // Transform the data to get just the league objects with proper typing
      const leaguesData = ((data as unknown) as LeagueMemberResponse[])?.map(item => item.league) || [];
      setLeagues(leaguesData);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeagues();
  }, []);

  return (
    <div className="p-8">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Leagues</h1>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const clipboardText = await navigator.clipboard.readText();
                  if (!clipboardText) {
                    addToast('No invite code found in clipboard', 'error');
                    return;
                  }

                  const { data: { user }, error: userError } = await supabase.auth.getUser();
                  if (userError) throw userError;
                  if (!user) {
                    addToast('You must be logged in to join a league', 'error');
                    return;
                  }

                  // First find the invite and the associated league
                  const { data: invite, error: inviteError } = await supabase
                    .from('league_invites')
                    .select('league_id')
                    .eq('code', clipboardText)
                    .is('used_at', null)
                    .single();

                  if (inviteError || !invite) {
                    addToast('Invalid or expired invite code', 'error');
                    return;
                  }

                  // Check if user is already a member
                  const { data: existingMember } = await supabase
                    .from('league_members')
                    .select('id')
                    .eq('league_id', invite.league_id)
                    .eq('user_id', user.id)
                    .single();

                  if (existingMember) {
                    addToast('You are already a member of this league', 'error');
                    return;
                  }

                  // Add user as a member
                  const { error: joinError } = await supabase
                    .from('league_members')
                    .insert({
                      league_id: invite.league_id,
                      user_id: user.id,
                      role: 'member'
                    });

                  if (joinError) throw joinError;

                  // Mark invite as used
                  const { error: updateError } = await supabase
                    .from('league_invites')
                    .update({
                      used_at: new Date().toISOString(),
                      used_by: user.id
                    })
                    .eq('code', clipboardText);

                  if (updateError) throw updateError;

                  addToast('Successfully joined league!', 'success');
                  // Refresh the leagues list
                  fetchLeagues();
                } catch (error) {
                  console.error('Error joining league:', error);
                  addToast('Failed to join league', 'error');
                }
              }}
            >
              Join League
            </Button>
          </div>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <LeagueCard type="create" />
            {leagues.map((league) => (
              <LeagueCard 
                key={league.id} 
                type="info" 
                league={transformLeagueForCard(league)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 