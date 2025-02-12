'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { useParams } from 'next/navigation';

interface League {
  id: string;
  name: string;
  scoring_type: 'category' | 'points' | 'both';
  num_teams: number;
  draft_type: 'snake' | 'auction' | 'linear';
  draft_date: string | null;
  status: 'active' | 'draft' | 'completed';
}

export default function LeagueDashboard() {
  const params = useParams();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeague() {
      try {
        const { data, error } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setLeague(data);
      } catch (error) {
        console.error('Error fetching league:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchLeague();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">League not found</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{league.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {league.scoring_type.charAt(0).toUpperCase() + league.scoring_type.slice(1)} League • {league.num_teams} Teams
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">League Info</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Format:</span> {league.scoring_type}</p>
            <p><span className="font-medium">Teams:</span> {league.num_teams}</p>
            <p><span className="font-medium">Draft Type:</span> {league.draft_type}</p>
            {league.draft_date && (
              <p><span className="font-medium">Draft Date:</span> {new Date(league.draft_date).toLocaleDateString()}</p>
            )}
            <p><span className="font-medium">Status:</span> {league.status || 'draft'}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Standings</h2>
          <p className="text-gray-600 dark:text-gray-400">Coming soon</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600 dark:text-gray-400">Coming soon</p>
        </Card>
      </div>
    </div>
  );
} 