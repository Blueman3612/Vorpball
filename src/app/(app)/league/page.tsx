'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import { useTranslations } from "@/lib/i18n";
import { useState } from "react";

export default function LeaguePage() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    scoringType: 'head-to-head',
    teams: '4',
    draftType: 'snake',
    draftDate: '',
    scoring: {
      pts: 1,
      drbs: 1.2,
      orbs: 1.5,
      asts: 1.5,
      stls: 2,
      blks: 2,
      tos: -1,
      fgm: 1,
      fga: -0.5,
      tpm: 1,
      tpa: -0.5,
      ftm: 1,
      fta: -0.5,
      dbl: 5,
      tpl: 10,
      qpl: 20,
      fls: -0.5,
      pt10: 1,
      rb10: 1,
      ast10: 1
    }
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScoringChange = (stat: keyof typeof formData.scoring, value: number) => {
    setFormData(prev => ({
      ...prev,
      scoring: {
        ...prev.scoring,
        [stat]: value
      }
    }));
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
      <div className="max-w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="space-y-0">
          {/* League Info Section */}
          <div>
            <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('league.create.form.sections.info.title')}
              </h2>
            </div>
            <div className="p-8">
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
            <div className="px-8 py-5 border-y border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('league.create.form.sections.settings.title')}
              </h2>
            </div>
            <div className="p-8">
              <div className="grid gap-8 md:grid-cols-2">
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
          </div>

          {/* Scoring Settings Section */}
          <div>
            <div className="px-8 py-5 border-y border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('league.create.form.sections.scoring.title')}
                </h2>
                <div className="w-48 mt-2 relative z-20">
                  <Select
                    label="Template"
                    value="default"
                    onChange={() => {}}
                    options={[
                      { value: 'default', label: 'Default' },
                      { value: 'draftkings', label: 'Draft Kings' }
                    ]}
                  />
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                <NumberInput
                  label="Point"
                  value={formData.scoring.pts}
                  onChange={(value) => handleScoringChange('pts', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="D Rebound"
                  value={formData.scoring.drbs}
                  onChange={(value) => handleScoringChange('drbs', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="O Rebound"
                  value={formData.scoring.orbs}
                  onChange={(value) => handleScoringChange('orbs', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="Assist"
                  value={formData.scoring.asts}
                  onChange={(value) => handleScoringChange('asts', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="Steal"
                  value={formData.scoring.stls}
                  onChange={(value) => handleScoringChange('stls', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="Block"
                  value={formData.scoring.blks}
                  onChange={(value) => handleScoringChange('blks', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="Turnover"
                  value={formData.scoring.tos}
                  onChange={(value) => handleScoringChange('tos', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="FG Make"
                  value={formData.scoring.fgm}
                  onChange={(value) => handleScoringChange('fgm', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="FG Attempt"
                  value={formData.scoring.fga}
                  onChange={(value) => handleScoringChange('fga', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="3P Make"
                  value={formData.scoring.tpm}
                  onChange={(value) => handleScoringChange('tpm', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="3P Attempt"
                  value={formData.scoring.tpa}
                  onChange={(value) => handleScoringChange('tpa', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="FT Make"
                  value={formData.scoring.ftm}
                  onChange={(value) => handleScoringChange('ftm', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="FT Attempt"
                  value={formData.scoring.fta}
                  onChange={(value) => handleScoringChange('fta', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="Dbl Dbl"
                  value={formData.scoring.dbl}
                  onChange={(value) => handleScoringChange('dbl', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="Trp Dbl"
                  value={formData.scoring.tpl}
                  onChange={(value) => handleScoringChange('tpl', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="Quad Dbl"
                  value={formData.scoring.qpl}
                  onChange={(value) => handleScoringChange('qpl', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="Foul"
                  value={formData.scoring.fls}
                  onChange={(value) => handleScoringChange('fls', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="10 PTS"
                  value={formData.scoring.pt10}
                  onChange={(value) => handleScoringChange('pt10', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="10 REB"
                  value={formData.scoring.rb10}
                  onChange={(value) => handleScoringChange('rb10', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
                <NumberInput
                  label="10 AST"
                  value={formData.scoring.ast10}
                  onChange={(value) => handleScoringChange('ast10', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                />
              </div>
            </div>
          </div>

          {/* Roster Settings Section */}
          <div>
            <div className="px-8 py-5 border-y border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('league.create.form.sections.roster.title')}
              </h2>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('league.create.form.sections.roster.defaultSettings')}
                </p>
                <ul className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  <li>• {t('league.create.form.sections.roster.positions.pg')}, {t('league.create.form.sections.roster.positions.sg')}, {t('league.create.form.sections.roster.positions.sf')}, {t('league.create.form.sections.roster.positions.pf')}, {t('league.create.form.sections.roster.positions.c')}</li>
                  <li>• {t('league.create.form.sections.roster.spots.bench', { count: 3 })}</li>
                  <li>• {t('league.create.form.sections.roster.spots.ir', { count: 2 })}</li>
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  {t('league.create.form.sections.roster.customize')}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
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