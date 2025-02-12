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
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
    ftm: 1,
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

const DEFAULT_ROSTER = {
  pg: 1,
  sg: 1,
  sf: 1,
  pf: 1,
  c: 1,
  g: 1,
  f: 1,
  gf: 0,
  fc: 0,
  util: 4,
  bench: 4,
  ir: 2
};

const DEFAULT_DYNASTY = {
  enabled: false,
  keepers: 6,
  salaryIncrease: 5,
  rookiesExempt: true
};

interface FormData {
  name: string;
  public: boolean;
  scoringType: string;
  teams: number;
  draftType: string;
  draftDate: string;
  roster: typeof DEFAULT_ROSTER;
  dynasty: typeof DEFAULT_DYNASTY;
  scoring: {
    pts: number;
    drbs: number;
    orbs: number;
    asts: number;
    stls: number;
    blks: number;
    tos: number;
    fgm: number;
    fga: number;
    tpm: number;
    tpa: number;
    ftm: number;
    fta: number;
    dbl: number;
    tpl: number;
    qpl: number;
    fls: number;
    pt10: number;
    rb10: number;
    ast10: number;
  };
}

export default function LeaguePage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(() => {
    const vorpballTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'vorpball')!;
    const initialData: FormData = {
      name: '',
      public: false,
      scoringType: 'category',
      teams: 10,
      draftType: 'snake',
      draftDate: '',
      roster: { ...DEFAULT_ROSTER },
      dynasty: { ...DEFAULT_DYNASTY },
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
    return initialData;
  });
  const [templates, setTemplates] = useState<ScoringTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('vorpball');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ScoringTemplate | null>(null);
  const [hasWarnings, setHasWarnings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customTemplates = templates.filter(t => t.created_by !== null);
  const hasReachedTemplateLimit = customTemplates.length >= 5;

  const hasRosterChanges = Object.entries(formData.roster).some(
    ([key, value]) => value !== DEFAULT_ROSTER[key as keyof typeof DEFAULT_ROSTER]
  );

  const handleChange = (field: string, value: string | number | boolean) => {
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

  const handleRosterChange = (position: keyof typeof formData.roster, value: number) => {
    setFormData(prev => ({
      ...prev,
      roster: {
        ...prev.roster,
        [position]: value
      }
    }));
  };

  const handleDynastyChange = (field: keyof typeof DEFAULT_DYNASTY, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      dynasty: {
        ...prev.dynasty,
        [field]: value
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
    }
  };

  useEffect(() => {
    // Only fetch custom templates on mount
    fetchCustomTemplates();
  }, []);

  const handleTemplateChange = (value: string | number) => {
    const template = templates.find(t => t.id === value);
    if (!template) return;

    setSelectedTemplate(template.id);
    setFormData(prev => ({
      ...prev,
      name: prev.name,
      public: prev.public,
      scoringType: prev.scoringType,
      teams: prev.teams,
      draftType: prev.draftType,
      draftDate: prev.draftDate,
      roster: prev.roster,
      dynasty: prev.dynasty,
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
    }));
  };

  const handleClearAll = () => {
    setFormData(prev => ({
      ...prev,
      name: prev.name,
      public: prev.public,
      scoringType: prev.scoringType,
      teams: prev.teams,
      draftType: prev.draftType,
      draftDate: prev.draftDate,
      roster: prev.roster,
      dynasty: prev.dynasty,
      scoring: {
        pts: 0,
        drbs: 0,
        orbs: 0,
        asts: 0,
        stls: 0,
        blks: 0,
        tos: 0,
        fgm: 0,
        fga: 0,
        tpm: 0,
        tpa: 0,
        ftm: 0,
        fta: 0,
        dbl: 0,
        tpl: 0,
        qpl: 0,
        fls: 0,
        pt10: 0,
        rb10: 0,
        ast10: 0
      }
    }));
  };

  const hasNonZeroValues = Object.values(formData.scoring).some(value => value !== 0);

  const formToTemplateValues = (formScoring: typeof formData.scoring): Omit<ScoringTemplate, 'id' | 'name' | 'created_by' | 'created_at'> => {
    return Object.fromEntries(
      Object.entries(formScoring).map(([key, value]) => [key, value === 0 ? null : value])
    ) as Omit<ScoringTemplate, 'id' | 'name' | 'created_by' | 'created_at'>;
  };

  const templatesMatch = (template1: Partial<ScoringTemplate>, template2: Partial<ScoringTemplate>): boolean => {
    const scoringFields = ['pts', 'drbs', 'orbs', 'asts', 'stls', 'blks', 'tos', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'dbl', 'tpl', 'qpl', 'fls', 'pt10', 'rb10', 'ast10'] as const;
    return scoringFields.every(field => {
      const val1 = template1[field] ?? 0;
      const val2 = template2[field] ?? 0;
      return Math.abs(Number(val1) - Number(val2)) < 0.001;
    });
  };

  const hasTemplateChanges = () => {
    const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
    if (!selectedTemplateData) return false;

    return !templatesMatch(formData.scoring, selectedTemplateData);
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

  const handleResetRoster = () => {
    setFormData(prev => ({
      ...prev,
      name: prev.name,
      public: prev.public,
      scoringType: prev.scoringType,
      teams: prev.teams,
      draftType: prev.draftType,
      draftDate: prev.draftDate,
      roster: { ...DEFAULT_ROSTER },
      dynasty: prev.dynasty,
      scoring: prev.scoring
    }));
  };

  const handleCreateLeague = async () => {
    if (hasWarnings || !formData.name.trim()) {
      addToast(
        hasWarnings 
          ? t('league.create.creation.validation.resolveWarnings')
          : t('league.create.creation.validation.nameRequired'),
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        addToast(t('league.create.creation.error.loginRequired'), 'error');
        return;
      }

      const draftDate = formData.draftDate ? new Date(formData.draftDate).toISOString() : null;

      const { data: league, error } = await supabase
        .from('leagues')
        .insert([
          {
            name: formData.name,
            created_by: user.id,
            scoring_type: formData.scoringType,
            num_teams: formData.teams,
            draft_type: formData.draftType,
            draft_date: draftDate,
            status: 'draft',
            // Add scoring settings
            pts: formData.scoring.pts,
            drbs: formData.scoring.drbs,
            orbs: formData.scoring.orbs,
            asts: formData.scoring.asts,
            stls: formData.scoring.stls,
            blks: formData.scoring.blks,
            tos: formData.scoring.tos,
            fgm: formData.scoring.fgm,
            fga: formData.scoring.fga,
            tpm: formData.scoring.tpm,
            tpa: formData.scoring.tpa,
            ftm: formData.scoring.ftm,
            fta: formData.scoring.fta,
            dbl: formData.scoring.dbl,
            tpl: formData.scoring.tpl,
            qpl: formData.scoring.qpl,
            fls: formData.scoring.fls,
            pt10: formData.scoring.pt10,
            rb10: formData.scoring.rb10,
            ast10: formData.scoring.ast10,
            // Add roster settings
            roster_pg: formData.roster.pg,
            roster_sg: formData.roster.sg,
            roster_sf: formData.roster.sf,
            roster_pf: formData.roster.pf,
            roster_c: formData.roster.c,
            roster_g: formData.roster.g,
            roster_f: formData.roster.f,
            roster_gf: formData.roster.gf,
            roster_fc: formData.roster.fc,
            roster_util: formData.roster.util,
            roster_bench: formData.roster.bench,
            roster_ir: formData.roster.ir,
            // Add dynasty settings
            is_dynasty: formData.dynasty.enabled,
            dynasty_keepers: formData.dynasty.keepers,
            dynasty_salary_increase: formData.dynasty.salaryIncrease,
            dynasty_rookies_exempt: formData.dynasty.rookiesExempt,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      addToast(t('league.create.creation.success'), 'success');
      router.push(`/league/${league.id}`);
    } catch (error) {
      console.error('Error creating league:', error);
      addToast(t('league.create.creation.error.generic'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <ToastContainer />
      <ConfirmationModal
        isOpen={templateToDelete !== null}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
        title={t('league.create.templates.delete.title')}
        description={t('league.create.templates.delete.description', { name: templateToDelete?.name })}
        confirmText={t('common.actions.delete')}
        cancelText={t('common.actions.cancel')}
        isDestructive={true}
        isLoading={isDeletingTemplate}
      />
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {t('league.create.title')}
      </h1>

      <div>
        {/* League Name and Public Toggle */}
        <div>
          <div className="px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  label={t('league.create.form.sections.info.leagueName.label')}
                  placeholder={t('league.create.form.sections.info.leagueName.placeholder')}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('common.labels.public')}
                </span>
                <Toggle
                  checked={formData.public}
                  onChange={(checked) => handleChange('public', checked)}
                  size="sm"
                />
              </div>
            </div>
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
                  { value: 'category', label: t('league.create.form.sections.settings.scoringType.options.category') },
                  { value: 'points', label: t('league.create.form.sections.settings.scoringType.options.points') },
                  { value: 'both', label: t('league.create.form.sections.settings.scoringType.options.both') }
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
              <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
                <div className="w-64 max-w-full relative z-20">
                  <Select
                    label={t('common.labels.template')}
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    options={templates.map(template => ({
                      value: template.id,
                      label: (
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {template.name}
                            {selectedTemplate === template.id && hasTemplateChanges() && (
                              <span className="text-warning-500 dark:text-warning-400 ml-1">*</span>
                            )}
                          </span>
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
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )
                    }))}
                  />
                </div>
                {!hasNonZeroValues && (
                  <div className="flex items-center gap-1.5 text-error-500 dark:text-error-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{t('common.validation.atLeastOneRequired')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {hasNonZeroValues && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleClearAll}
                      className="mt-2"
                    >
                      {t('common.actions.clearAll')}
                    </Button>
                  )}
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    <Input
                      label={t('common.labels.customTemplate')}
                      placeholder={hasReachedTemplateLimit 
                        ? t('common.validation.templateLimitReached')
                        : t('common.placeholders.enterTemplateName')
                      }
                      value={hasReachedTemplateLimit ? t('common.validation.templateLimitReached') : newTemplateName}
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
                      {t('common.actions.save')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
              {Object.entries(formData.scoring).map(([key, value]) => (
                <NumberInput
                  key={`${key}-${selectedTemplate}`}
                  label={t(`league.create.form.sections.scoring.stats.${key}`)}
                  value={value}
                  onChange={(value) => handleScoringChange(key as keyof typeof formData.scoring, value)}
                  min={-100}
                  max={100}
                  step={0.05}
                  defaultEmptyValue={0}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Roster Settings Section */}
        <div>
          <div className="px-8 py-5 border-y border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('league.create.form.sections.roster.title')}
                </h2>
                {(formData.roster.pg + formData.roster.sg + formData.roster.sf + 
                  formData.roster.pf + formData.roster.c + formData.roster.g + 
                  formData.roster.f + formData.roster.gf + formData.roster.fc + 
                  formData.roster.util) === 0 ? (
                  <div className="flex items-center gap-1.5 text-error-500 dark:text-error-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{t('common.validation.atLeastOneActiveSpot')}</span>
                  </div>
                ) : (formData.roster.pg + formData.roster.sg + formData.roster.sf + 
                  formData.roster.pf + formData.roster.c + formData.roster.g + 
                  formData.roster.f + formData.roster.gf + formData.roster.fc + 
                  formData.roster.util + formData.roster.bench) !== 15 && (
                  <div className="flex items-center gap-1.5 text-warning-500 dark:text-warning-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{t('common.validation.recommendedRosterSize')}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">{t('league.create.form.sections.roster.stats.active')}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.roster.pg + formData.roster.sg + formData.roster.sf + 
                     formData.roster.pf + formData.roster.c + formData.roster.g + 
                     formData.roster.f + formData.roster.gf + formData.roster.fc + 
                     formData.roster.util}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">{t('league.create.form.sections.roster.stats.inactive')}:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.roster.bench}
                  </span>
                </div>
                {hasRosterChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetRoster}
                  >
                    {t('common.actions.reset')}
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(90px,1fr))]">
              {Object.entries(formData.roster).map(([key, value]) => (
                <NumberInput
                  key={key}
                  label={t(`league.create.form.sections.roster.positions.${key}`)}
                  value={value}
                  onChange={(value) => handleRosterChange(key as keyof typeof formData.roster, value)}
                  min={0}
                  max={99}
                  step={1}
                  defaultEmptyValue={0}
                  minWidth="90px"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynasty League Section */}
        <div className={cn(
          formData.dynasty?.enabled && "border-b border-gray-200 dark:border-gray-700"
        )}>
          <div className="px-8 py-5 border-y border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('league.create.form.sections.dynasty.title')}
              </h2>
              <Toggle
                checked={formData.dynasty?.enabled ?? false}
                onChange={(checked) => handleDynastyChange('enabled', checked)}
                size="sm"
              />
            </div>
          </div>
          {formData.dynasty?.enabled && (
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-8">
                <div className="w-[140px]">
                  <NumberInput
                    label={t('league.create.form.sections.dynasty.settings.keepers')}
                    value={formData.dynasty?.keepers ?? 6}
                    onChange={(value) => handleDynastyChange('keepers', value)}
                    min={0}
                    max={formData.roster.pg + formData.roster.sg + formData.roster.sf + 
                         formData.roster.pf + formData.roster.c + formData.roster.g + 
                         formData.roster.f + formData.roster.gf + formData.roster.fc + 
                         formData.roster.util + formData.roster.bench}
                    step={1}
                    defaultEmptyValue={0}
                    minWidth="140px"
                  />
                </div>
                <div className="w-[240px]">
                  <NumberInput
                    label={t('league.create.form.sections.dynasty.settings.salaryIncrease')}
                    value={formData.dynasty?.salaryIncrease ?? 5}
                    onChange={(value) => handleDynastyChange('salaryIncrease', value)}
                    min={0}
                    max={100}
                    step={1}
                    defaultEmptyValue={0}
                    minWidth="240px"
                  />
                </div>
                <div className="flex items-center gap-3 min-w-[200px]">
                  <Toggle
                    checked={formData.dynasty?.rookiesExempt ?? true}
                    onChange={(checked) => handleDynastyChange('rookiesExempt', checked)}
                    size="md"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('league.create.form.sections.dynasty.settings.rookiesExempt')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-8 border-gray-200 dark:border-gray-700 flex justify-end gap-4">
          <Button
            variant="outline"
          >
            {t('common.actions.saveAsDraft')}
          </Button>
          <Button
            variant="affirmative"
            onClick={handleCreateLeague}
            disabled={isSubmitting || hasWarnings || !formData.name.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                {t('common.states.creating')}
              </>
            ) : (
              t('common.actions.create')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 