'use client';

import { LeagueCard } from '@/components/ui/league-card';

export default function LeaguePage() {
  return (
    <div className="p-8">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <LeagueCard type="create" />
      </div>
    </div>
  );
} 