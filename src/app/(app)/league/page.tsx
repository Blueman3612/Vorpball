'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n";

export default function LeaguePage() {
  const { t } = useTranslations();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('league.create.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('league.create.description')}
        </p>
      </div>

      {/* League Creation Form */}
      <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {/* League Info Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('league.create.form.sections.info.title')}
            </h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('league.create.form.sections.info.leagueName.label')}
                </label>
                <input
                  type="text"
                  placeholder={t('league.create.form.sections.info.leagueName.placeholder')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* League Settings Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('league.create.form.sections.settings.title')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('league.create.form.sections.settings.scoringType.label')}
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option>{t('league.create.form.sections.settings.scoringType.options.headToHead')}</option>
                  <option>{t('league.create.form.sections.settings.scoringType.options.points')}</option>
                  <option>{t('league.create.form.sections.settings.scoringType.options.roto')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('league.create.form.sections.settings.teams.label')}
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 4} value={i + 4}>
                      {t('league.create.form.sections.settings.teams.teamCount', { count: i + 4 })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('league.create.form.sections.settings.draftType.label')}
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option>{t('league.create.form.sections.settings.draftType.options.snake')}</option>
                  <option>{t('league.create.form.sections.settings.draftType.options.auction')}</option>
                  <option>{t('league.create.form.sections.settings.draftType.options.linear')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('league.create.form.sections.settings.draftDate.label')}
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Roster Settings Preview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('league.create.form.sections.roster.title')}
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('league.create.form.sections.roster.defaultSettings')}
              </p>
              <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• {t('league.create.form.sections.roster.positions.pg')}, {t('league.create.form.sections.roster.positions.sg')}, {t('league.create.form.sections.roster.positions.sf')}, {t('league.create.form.sections.roster.positions.pf')}, {t('league.create.form.sections.roster.positions.c')}</li>
                <li>• {t('league.create.form.sections.roster.spots.bench', { count: 3 })}</li>
                <li>• {t('league.create.form.sections.roster.spots.ir', { count: 2 })}</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
              >
                {t('league.create.form.sections.roster.customize')}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
            >
              {t('common.actions.saveAsDraft')}
            </Button>
            <Button
              variant="affirmative"
            >
              {t('common.actions.create')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 