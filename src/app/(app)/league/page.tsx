'use client';

import { useEffect, useState } from 'react';
import { LeagueCard } from '@/components/ui/league-card';
import { supabase } from '@/lib/supabase/client';

interface League {
  id: string;
  name: string;
  scoring_type: 'category' | 'points' | 'both';
  num_teams: number;
  draft_type: 'snake' | 'auction' | 'linear';
  draft_date: string | null;
  status: 'active' | 'draft' | 'completed';
}

export default function LeaguePage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeagues() {
      try {
        const { data, error } = await supabase
          .from('leagues')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeagues(data || []);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeagues();
  }, []);

  return (
    <div className="p-8">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <LeagueCard type="create" />
          {leagues.map((league) => (
            <LeagueCard 
              key={league.id} 
              type="info" 
              league={league}
            />
          ))}
        </div>
      )}
    </div>
  );
} 