'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import { useTranslations } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { addToast, ToastContainer } from "@/components/ui/toast";
import { ConfirmationModal } from "@/components/ui/modal";

interface ScoringTemplate {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string | null;
  pts: number | null;
  drbs: number | null;
  orbs: number | null;
  asts: number | null;
  stls: number | null;
  blks: number | null;
  tos: number | null;
  fgm: number | null;
  fga: number | null;
  tpm: number | null;
  tpa: number | null;
  ftm: number | null;
  fta: number | null;
  dbl: number | null;
  tpl: number | null;
  qpl: number | null;
  fls: number | null;
  pt10: number | null;
  rb10: number | null;
  ast10: number | null;
}

const DEFAULT_TEMPLATES: ScoringTemplate[] = [
  {
    id: 'vorpball',
    name: 'VorpBall',
    created_by: null,
    created_at: null,
    pts: 0.75,
    drbs: 1.25,
    orbs: 1.5,
    asts: 2,
    stls: 2.5,
    blks: 2.5,
    tos: -1,
    fgm: 1,
    fga: -0.3,
    tpm: 1,
    tpa: -0.2,
    ftm: 1,
    fta: -0.6,
    dbl: null,
    tpl: null,
    qpl: 100,
    fls: null,
    pt10: 2,
    rb10: 3,
    ast10: 5
  },
  {
    id: 'nba',
    name: 'NBA',
    created_by: null,
    created_at: null,
    pts: null,
    drbs: 1.2,
    orbs: 1.2,
    asts: 1.5,
    stls: 3,
    blks: 3,
    tos: -1,
    fgm: 2,
    fga: null,
    tpm: 1,
    tpa: null,
    ftm: null,
    fta: null,
    dbl: null,
    tpl: null,
    qpl: null,
    fls: null,
    pt10: null,
    rb10: null,
    ast10: null
  },
  {
    id: 'draftkings',
    name: 'DraftKings',
    created_by: null,
    created_at: null,
    pts: 1,
    drbs: 1.25,
    orbs: 1.25,
    asts: 1.5,
    stls: 2,
    blks: 2,
    tos: -0.5,
    fgm: null,
    fga: null,
    tpm: 0.5,
    tpa: null,
    ftm: null,
    fta: null,
    dbl: 1.5,
    tpl: 3,
    qpl: null,
    fls: null,
    pt10: null,
    rb10: null,
    ast10: null
  }
];

export default function LeaguePage() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState(() => {
    const vorpballTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'vorpball')!;
    return {
      name: '',
      scoringType: 'head-to-head',
      teams: 10,
      draftType: 'snake',
      draftDate: '',
      scoring: {
        pts: Number(vorpballTemplate.pts ?? 0),
        drbs: Number(vorpballTemplate.drbs ?? 0),
        orbs: Number(vorpballTemplate.orbs ?? 0),
        asts: Number(vorpballTemplate.asts ?? 0),
        stls: Number(vorpballTemplate.stls ?? 0),
        blks: Number(vorpballTemplate.blks ?? 0),
        tos: Number(vorpballTemplate.tos ?? 0),
        fgm: Number(vorpballTemplate.fgm ?? 0),
        fga: Number(vorpballTemplate.fga ?? 0),
        tpm: Number(vorpballTemplate.tpm ?? 0),
        tpa: Number(vorpballTemplate.tpa ?? 0),
        ftm: Number(vorpballTemplate.ftm ?? 0),
        fta: Number(vorpballTemplate.fta ?? 0),
        dbl: Number(vorpballTemplate.dbl ?? 0),
        tpl: Number(vorpballTemplate.tpl ?? 0),
        qpl: Number(vorpballTemplate.qpl ?? 0),
        fls: Number(vorpballTemplate.fls ?? 0),
        pt10: Number(vorpballTemplate.pt10 ?? 0),
        rb10: Number(vorpballTemplate.rb10 ?? 0),
        ast10: Number(vorpballTemplate.ast10 ?? 0)
      }
    };
  });
  const [templates, setTemplates] = useState<ScoringTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('vorpball');
  const [isLoading, setIsLoading] = useState(true);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ScoringTemplate | null>(null);

  const customTemplates = templates.filter(t => t.created_by !== null);
  const hasReachedTemplateLimit = customTemplates.length >= 5;

  const handleChange = (field: string, value: string | number) => {
    if (field === 'teams' && (value === '' || value === 0)) {
      setFormData(prev => ({ ...prev, [field]: 10 }));
      return;
    }
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

  const fetchCustomTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('scoring_templates')
        .select('*')
        .not('created_by', 'is', null); // Only fetch custom templates
      
      if (error) throw error;
      
      // Combine default and custom templates
      setTemplates([...DEFAULT_TEMPLATES, ...(data || [])]);
    } catch (error) {
      console.error('Error fetching custom templates:', error);
      addToast('Failed to load custom templates', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch custom templates on mount
    fetchCustomTemplates();
  }, []);

  const handleTemplateChange = (value: string | number) => {
    const templateId = String(value);
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newFormData = {
      name: formData.name,
      scoringType: formData.scoringType,
      teams: formData.teams,
      draftType: formData.draftType,
      draftDate: formData.draftDate,
      scoring: {
        pts: Number(template.pts ?? 0),
        drbs: Number(template.drbs ?? 0),
        orbs: Number(template.orbs ?? 0),
        asts: Number(template.asts ?? 0),
        stls: Number(template.stls ?? 0),
        blks: Number(template.blks ?? 0),
        tos: Number(template.tos ?? 0),
        fgm: Number(template.fgm ?? 0),
        fga: Number(template.fga ?? 0),
        tpm: Number(template.tpm ?? 0),
        tpa: Number(template.tpa ?? 0),
        ftm: Number(template.ftm ?? 0),
        fta: Number(template.fta ?? 0),
        dbl: Number(template.dbl ?? 0),
        tpl: Number(template.tpl ?? 0),
        qpl: Number(template.qpl ?? 0),
        fls: Number(template.fls ?? 0),
        pt10: Number(template.pt10 ?? 0),
        rb10: Number(template.rb10 ?? 0),
        ast10: Number(template.ast10 ?? 0)
      }
    };

    setFormData(newFormData);
    addToast(`Loaded "${template.name}" scoring template`);
  };

  const handleClearAll = () => {
    const clearedScoring = Object.fromEntries(
      Object.keys(formData.scoring).map(key => [key, 0])
    ) as typeof formData.scoring;
    
    setFormData(prev => ({
      ...prev,
      scoring: clearedScoring
    }));
    setSelectedTemplate('');
    addToast('All scoring values cleared');
  };

  const hasNonZeroValues = Object.values(formData.scoring).some(value => value !== 0);

  const formToTemplateValues = (formScoring: typeof formData.scoring): Omit<ScoringTemplate, 'id' | 'name' | 'created_by' | 'created_at'> => {
    return Object.fromEntries(
      Object.entries(formScoring).map(([key, value]) => [key, value === 0 ? null : value])
    ) as Omit<ScoringTemplate, 'id' | 'name' | 'created_by' | 'created_at'>;
  };

  const templatesMatch = (template1: Partial<ScoringTemplate>, template2: Partial<ScoringTemplate>): boolean => {
    const scoringFields = ['pts', 'drbs', 'orbs', 'asts', 'stls', 'blks', 'tos', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'dbl', 'tpl', 'qpl', 'fls', 'pt10', 'rb10', 'ast10'] as const;
    return scoringFields.every(field => template1[field] === template2[field]);
  };

  const handleDeleteTemplate = async (template: ScoringTemplate) => {
    if (!template || !template.created_by) return;

    try {
      setIsDeletingTemplate(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        addToast('You must be logged in to delete templates', 'error');
        return;
      }

      // Verify the template belongs to the user
      if (template.created_by !== user.id) {
        addToast('You can only delete your own templates', 'error');
        return;
      }

      const { error: deleteError } = await supabase
        .from('scoring_templates')
        .delete()
        .eq('id', template.id)
        .eq('created_by', user.id);

      if (deleteError) throw deleteError;

      addToast('Template deleted successfully');
      if (selectedTemplate === template.id) {
        setSelectedTemplate('vorpball');
        handleTemplateChange('vorpball');
      }
      
      // Refresh templates
      fetchCustomTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      addToast('Failed to delete template', 'error');
    } finally {
      setIsDeletingTemplate(false);
      setTemplateToDelete(null);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      addToast('Please enter a template name', 'error');
      return;
    }

    try {
      setIsSavingTemplate(true);

      // Get current user first to check template limit
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        addToast('You must be logged in to save templates', 'error');
        return;
      }

      // Check template limit
      if (hasReachedTemplateLimit) {
        addToast('You have reached the maximum limit of 5 custom templates', 'error');
        return;
      }

      // Convert form values to template format (0s to NULLs)
      const templateValues = formToTemplateValues(formData.scoring);

      // Check if the template matches any default template
      const matchingDefault = DEFAULT_TEMPLATES.find(defaultTemplate => 
        templatesMatch(templateValues, defaultTemplate)
      );

      if (matchingDefault) {
        addToast(`Cannot save - matches default template "${matchingDefault.name}"`, 'error');
        return;
      }

      // Check if a template with this name already exists
      const { data: existingTemplates, error: checkError } = await supabase
        .from('scoring_templates')
        .select('name, created_by')
        .eq('name', newTemplateName.trim());

      if (checkError) throw checkError;

      if (existingTemplates?.length > 0) {
        const template = existingTemplates[0];
        if (!template.created_by) {
          addToast('Cannot override default template', 'error');
          return;
        }
        addToast('A template with this name already exists', 'error');
        return;
      }

      // Save the template with NULL values instead of 0s
      const { error: saveError } = await supabase
        .from('scoring_templates')
        .insert({
          name: newTemplateName.trim(),
          created_by: user.id,
          created_at: new Date().toISOString(),
          ...templateValues
        });

      if (saveError) throw saveError;

      addToast('Template saved successfully');
      setNewTemplateName('');
      
      // Refresh templates
      fetchCustomTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      addToast('Failed to save template', 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className="p-8">
      <ToastContainer />
      <ConfirmationModal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
        title="Delete Template"
        description={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeletingTemplate}
      />
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
                <NumberInput
                  label={t('league.create.form.sections.settings.teams.label')}
                  value={Number(formData.teams)}
                  onChange={(value) => handleChange('teams', value)}
                  min={2}
                  max={16}
                  step={1}
                  showClearButton={false}
                  defaultEmptyValue={10}
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
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('league.create.form.sections.scoring.title')}
                </h2>
                <div className="flex flex-row flex-wrap items-start gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-64 max-w-full mt-2 relative z-20">
                      <Select
                        label="Template"
                        value={selectedTemplate}
                        onChange={handleTemplateChange}
                        options={templates.map(template => ({
                          value: template.id,
                          label: (
                            <div className="flex items-center justify-between w-full">
                              <span>{template.name}</span>
                              {template.created_by && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const selectedTemplate = templates.find(t => t.id === template.id);
                                    if (!selectedTemplate) return;
                                    setTemplateToDelete(selectedTemplate);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const selectedTemplate = templates.find(t => t.id === template.id);
                                      if (!selectedTemplate) return;
                                      setTemplateToDelete(selectedTemplate);
                                    }
                                  }}
                                  className="p-1 text-gray-400 hover:text-error-500 dark:text-gray-500 dark:hover:text-error-500 transition-colors ml-auto cursor-pointer"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          )
                        }))}
                      />
                    </div>
                  </div>
                  {hasNonZeroValues && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      className="mt-2"
                    >
                      Clear All
                    </Button>
                  )}
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    <Input
                      label="Custom Template"
                      placeholder="Enter template name"
                      value={hasReachedTemplateLimit ? "Custom template limit reached (5/5)" : newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value.slice(0, 24))}
                      className="w-64 max-w-full mt-2"
                      maxLength={24}
                      disabled={hasReachedTemplateLimit}
                    />
                    <Button
                      variant="affirmative"
                      size="sm"
                      onClick={handleSaveTemplate}
                      disabled={isSavingTemplate || !newTemplateName.trim() || hasReachedTemplateLimit}
                      isLoading={isSavingTemplate}
                      className="mt-2"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                <NumberInput
                  key={`pts-${selectedTemplate}`}
                  label="Point"
                  value={formData.scoring.pts}
                  onChange={(value) => handleScoringChange('pts', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`drbs-${selectedTemplate}`}
                  label="D Rebound"
                  value={formData.scoring.drbs}
                  onChange={(value) => handleScoringChange('drbs', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`orbs-${selectedTemplate}`}
                  label="O Rebound"
                  value={formData.scoring.orbs}
                  onChange={(value) => handleScoringChange('orbs', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`asts-${selectedTemplate}`}
                  label="Assist"
                  value={formData.scoring.asts}
                  onChange={(value) => handleScoringChange('asts', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`stls-${selectedTemplate}`}
                  label="Steal"
                  value={formData.scoring.stls}
                  onChange={(value) => handleScoringChange('stls', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`blks-${selectedTemplate}`}
                  label="Block"
                  value={formData.scoring.blks}
                  onChange={(value) => handleScoringChange('blks', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`tos-${selectedTemplate}`}
                  label="Turnover"
                  value={formData.scoring.tos}
                  onChange={(value) => handleScoringChange('tos', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`fgm-${selectedTemplate}`}
                  label="FG Make"
                  value={formData.scoring.fgm}
                  onChange={(value) => handleScoringChange('fgm', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`fga-${selectedTemplate}`}
                  label="FG Attempt"
                  value={formData.scoring.fga}
                  onChange={(value) => handleScoringChange('fga', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`tpm-${selectedTemplate}`}
                  label="3P Make"
                  value={formData.scoring.tpm}
                  onChange={(value) => handleScoringChange('tpm', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`tpa-${selectedTemplate}`}
                  label="3P Attempt"
                  value={formData.scoring.tpa}
                  onChange={(value) => handleScoringChange('tpa', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`ftm-${selectedTemplate}`}
                  label="FT Make"
                  value={formData.scoring.ftm}
                  onChange={(value) => handleScoringChange('ftm', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`fta-${selectedTemplate}`}
                  label="FT Attempt"
                  value={formData.scoring.fta}
                  onChange={(value) => handleScoringChange('fta', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`dbl-${selectedTemplate}`}
                  label="Dbl Dbl"
                  value={formData.scoring.dbl}
                  onChange={(value) => handleScoringChange('dbl', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`tpl-${selectedTemplate}`}
                  label="Trp Dbl"
                  value={formData.scoring.tpl}
                  onChange={(value) => handleScoringChange('tpl', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`qpl-${selectedTemplate}`}
                  label="Quad Dbl"
                  value={formData.scoring.qpl}
                  onChange={(value) => handleScoringChange('qpl', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`fls-${selectedTemplate}`}
                  label="Foul"
                  value={formData.scoring.fls}
                  onChange={(value) => handleScoringChange('fls', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`pt10-${selectedTemplate}`}
                  label="10+ PTS"
                  value={formData.scoring.pt10}
                  onChange={(value) => handleScoringChange('pt10', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`rb10-${selectedTemplate}`}
                  label="10+ REB"
                  value={formData.scoring.rb10}
                  onChange={(value) => handleScoringChange('rb10', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
                <NumberInput
                  key={`ast10-${selectedTemplate}`}
                  label="10+ AST"
                  value={formData.scoring.ast10}
                  onChange={(value) => handleScoringChange('ast10', value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
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