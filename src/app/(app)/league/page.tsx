'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTranslations } from "@/lib/i18n";
import { useState } from "react";

export default function LeaguePage() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    scoringType: 'head-to-head',
    teams: '4',
    draftType: 'snake',
    draftDate: ''
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
              <Input
                label={t('league.create.form.sections.info.leagueName.label')}
                placeholder={t('league.create.form.sections.info.leagueName.placeholder')}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
          </div>

          {/* League Settings Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('league.create.form.sections.settings.title')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Select
                label={t('league.create.form.sections.settings.scoringType.label')}
                value={formData.scoringType}
                onChange={(value) => handleChange('scoringType', value)}
                options={[
                  { value: 'head-to-head', label: t('league.create.form.sections.settings.scoringType.options.headToHead') },
                  { value: 'points', label: t('league.create.form.sections.settings.scoringType.options.points') },
                  { value: 'roto', label: t('league.create.form.sections.settings.scoringType.options.roto') }
                ]}
              />
              <Select
                label={t('league.create.form.sections.settings.teams.label')}
                value={formData.teams}
                onChange={(value) => handleChange('teams', value)}
                options={[...Array(12)].map((_, i) => ({
                  value: String(i + 4),
                  label: t('league.create.form.sections.settings.teams.teamCount', { count: i + 4 })
                }))}
              />
              <Select
                label={t('league.create.form.sections.settings.draftType.label')}
                value={formData.draftType}
                onChange={(value) => handleChange('draftType', value)}
                options={[
                  { value: 'snake', label: t('league.create.form.sections.settings.draftType.options.snake') },
                  { value: 'auction', label: t('league.create.form.sections.settings.draftType.options.auction') },
                  { value: 'linear', label: t('league.create.form.sections.settings.draftType.options.linear') }
                ]}
              />
              <Input
                type="datetime-local"
                label={t('league.create.form.sections.settings.draftDate.label')}
                value={formData.draftDate}
                onChange={(e) => handleChange('draftDate', e.target.value)}
              />
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