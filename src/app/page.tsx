'use client';

import { useState } from 'react';

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome to your fantasy basketball dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">League Rank</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">3rd</p>
          <p className="text-green-600 dark:text-green-500 text-sm">↑ Up 2 positions this week</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Points</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
          <p className="text-green-600 dark:text-green-500 text-sm">↑ 15% increase</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Players</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">8/10</p>
          <p className="text-yellow-600 dark:text-yellow-500 text-sm">2 players on bench</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Performance</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Player Name</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last game stats</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">32 pts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">8 reb, 5 ast</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Games */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Games</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Team A vs Team B</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tomorrow, 7:30 PM</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-500">3 players</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View details</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
