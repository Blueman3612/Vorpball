'use client';

import { Tabs, type Tab } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n';
import { Card } from '@/components/ui/card';

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
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Trade Offers</h3>
          <div className="h-10 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="space-y-3 flex-1">
                  <div className="h-5 w-1/3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="flex space-x-3">
                  <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
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
      id: 'settings',
      label: t('common.tabs.settings'),
      content: <SettingsTab />
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <Tabs tabs={tabs} variant="default" />
    </div>
  );
} 