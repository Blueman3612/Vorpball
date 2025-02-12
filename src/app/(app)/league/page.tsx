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
import { LeagueCard } from '@/components/ui/league-card';

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
  });
  const [templates, setTemplates] = useState<ScoringTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('vorpball');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ScoringTemplate | null>(null);

  const customTemplates = templates.filter(t => t.created_by !== null);
  const hasReachedTemplateLimit = customTemplates.length >= 5;

  const hasRosterChanges = Object.entries(formData.roster).some(
    ([key, value]) => value !== DEFAULT_ROSTER[key as keyof typeof DEFAULT_ROSTER]
  );

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
      roster: formData.roster,
      dynasty: formData.dynasty,
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

  const handleResetRoster = () => {
    setFormData(prev => ({
      ...prev,
      roster: { ...DEFAULT_ROSTER }
    }));
  };

  return (
    <div className="p-8">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <LeagueCard type="create" />
      </div>
    </div>
  );
} 