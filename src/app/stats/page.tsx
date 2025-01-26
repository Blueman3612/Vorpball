'use client';

export default function StatsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stats & Analysis</h1>
        <p className="text-gray-500 dark:text-gray-400">Track performance and analyze trends</p>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Points */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Points</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">114.5</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-500">↑ 2.3%</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">vs last week</span>
          </div>
        </div>

        {/* Rebounds */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rebounds</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">45.2</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-red-600 dark:text-red-500">↓ 1.1%</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">vs last week</span>
          </div>
        </div>

        {/* Assists */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Assists</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">24.8</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-500">↑ 3.7%</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">vs last week</span>
          </div>
        </div>

        {/* Field Goal % */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Field Goal %</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">47.2%</p>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 dark:text-green-500">↑ 0.5%</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400">vs last week</span>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Trends</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <span className="text-gray-500 dark:text-gray-400">Chart placeholder</span>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performers</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Player Name {i}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">PG • Team Name</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">32.5 PPG</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 