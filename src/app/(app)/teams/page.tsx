'use client';

export default function TeamsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Teams</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your fantasy basketball teams</p>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Team Card */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors">
          <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium">Create New Team</span>
          </div>
        </div>

        {/* Example Team Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dream Team</h3>
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 rounded-full">
              Active
            </span>
          </div>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">League: Pro Division</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Rank: 3rd of 12</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Record: 15-7</p>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Next game in 2 days</span>
            <button className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Manage Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 