'use client';

import { Tabs, type Tab } from '@/components/ui/tabs';
import { useTranslations } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { addToast, ToastContainer } from '@/components/ui/toast';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NumberInput } from "@/components/ui/number-input";
import { ConfirmationModal } from "@/components/ui/modal";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

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

// Dashboard Tab Component
function DashboardTab() {
  const { t } = useTranslations();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('common.sections.leagueStandings')}</h3>
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('common.sections.recentActivity')}</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t('common.sections.leagueCalendar')}</h3>
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
  const { t } = useTranslations();
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('common.sections.myRoster')}</h3>
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
  const { t } = useTranslations();
  const [teams, setTeams] = useState([
    { id: 'user', name: 'Your Team' }
  ]);
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  const handleAddTeam = () => {
    setIsAddingTeam(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{t('common.sections.createTrade')}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTeam}
            disabled={teams.length >= 4 || isAddingTeam}
            className="flex items-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t('common.actions.addTeamToTrade')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div 
              key={team.id}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200" />
              <div className="relative p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">{team.name}</h4>
                  {team.id !== 'user' && (
                    <button
                      onClick={() => setTeams(teams.filter(t => t.id !== team.id))}
                      className="text-gray-400 hover:text-error-500 dark:text-gray-500 dark:hover:text-error-500 transition-colors"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {t('common.sections.selectPlayersToTrade')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                  >
                    {t('common.actions.addPlayer')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {teams.length > 1 && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="affirmative"
              size="sm"
              className="flex items-center gap-2"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t('common.actions.proposeTrade')}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">{t('common.sections.pendingTrades')}</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('common.sections.noPendingTrades')}
        </div>
      </Card>
    </div>
  );
}

// Talk Tab Component
function TalkTab() {
  const { id: leagueId } = useParams();
  
  return (
    <div className="h-[calc(100vh-12rem)]">
      <ChatInterface leagueId={leagueId as string} />
    </div>
  );
}

// Settings Tab Component
function SettingsTab() {
  const { t } = useTranslations();
  const { id: leagueId } = useParams();
  const [formData, setFormData] = useState<FormData>(() => ({
    name: '',
    public: false,
    scoringType: 'category',
    teams: 10,
    draftType: 'snake',
    draftDate: '',
    roster: { ...DEFAULT_ROSTER },
    dynasty: { ...DEFAULT_DYNASTY },
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
  const [templates, setTemplates] = useState<ScoringTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('vorpball');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ScoringTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasNonZeroValues = Object.values(formData.scoring).some(value => value !== 0);
  const hasRosterChanges = JSON.stringify(formData.roster) !== JSON.stringify(DEFAULT_ROSTER);

  useEffect(() => {
    async function fetchLeagueSettings() {
      try {
        setIsLoading(true);
        console.log('Fetching league settings for ID:', leagueId);
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select(`
            id,
            name,
            is_public,
            scoring_type,
            num_teams,
            draft_type,
            draft_date,
            roster_pg,
            roster_sg,
            roster_sf,
            roster_pf,
            roster_c,
            roster_g,
            roster_f,
            roster_gf,
            roster_fc,
            roster_util,
            roster_bench,
            roster_ir,
            is_dynasty,
            dynasty_keepers,
            dynasty_salary_increase,
            dynasty_rookies_exempt,
            pts,
            drbs,
            orbs,
            asts,
            stls,
            blks,
            tos,
            fgm,
            fga,
            tpm,
            tpa,
            ftm,
            fta,
            dbl,
            tpl,
            qpl,
            fls,
            pt10,
            rb10,
            ast10
          `)
          .eq('id', leagueId)
          .single();

        if (leagueError) {
          console.error('Supabase error details:', leagueError);
          throw leagueError;
        }

        if (!leagueData) {
          console.error('No league data found for ID:', leagueId);
          throw new Error('No league data found');
        }

        console.log('Successfully fetched league data:', leagueData);

        // Transform the data to match our form structure
        setFormData({
          name: leagueData.name,
          public: leagueData.is_public,
          scoringType: leagueData.scoring_type,
          teams: leagueData.num_teams,
          draftType: leagueData.draft_type,
          draftDate: leagueData.draft_date || '',
          roster: {
            pg: leagueData.roster_pg || DEFAULT_ROSTER.pg,
            sg: leagueData.roster_sg || DEFAULT_ROSTER.sg,
            sf: leagueData.roster_sf || DEFAULT_ROSTER.sf,
            pf: leagueData.roster_pf || DEFAULT_ROSTER.pf,
            c: leagueData.roster_c || DEFAULT_ROSTER.c,
            g: leagueData.roster_g || DEFAULT_ROSTER.g,
            f: leagueData.roster_f || DEFAULT_ROSTER.f,
            gf: leagueData.roster_gf || DEFAULT_ROSTER.gf,
            fc: leagueData.roster_fc || DEFAULT_ROSTER.fc,
            util: leagueData.roster_util || DEFAULT_ROSTER.util,
            bench: leagueData.roster_bench || DEFAULT_ROSTER.bench,
            ir: leagueData.roster_ir || DEFAULT_ROSTER.ir
          },
          dynasty: {
            enabled: leagueData.is_dynasty || DEFAULT_DYNASTY.enabled,
            keepers: leagueData.dynasty_keepers || DEFAULT_DYNASTY.keepers,
            salaryIncrease: leagueData.dynasty_salary_increase || DEFAULT_DYNASTY.salaryIncrease,
            rookiesExempt: leagueData.dynasty_rookies_exempt || DEFAULT_DYNASTY.rookiesExempt
          },
          scoring: {
            pts: leagueData.pts || 0,
            drbs: leagueData.drbs || 0,
            orbs: leagueData.orbs || 0,
            asts: leagueData.asts || 0,
            stls: leagueData.stls || 0,
            blks: leagueData.blks || 0,
            tos: leagueData.tos || 0,
            fgm: leagueData.fgm || 0,
            fga: leagueData.fga || 0,
            tpm: leagueData.tpm || 0,
            tpa: leagueData.tpa || 0,
            ftm: leagueData.ftm || 0,
            fta: leagueData.fta || 0,
            dbl: leagueData.dbl || 0,
            tpl: leagueData.tpl || 0,
            qpl: leagueData.qpl || 0,
            fls: leagueData.fls || 0,
            pt10: leagueData.pt10 || 0,
            rb10: leagueData.rb10 || 0,
            ast10: leagueData.ast10 || 0
          }
        });
      } catch (error) {
        console.error('Error fetching league settings:', error);
        addToast('Failed to load league settings', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeagueSettings();
  }, [leagueId]);

  useEffect(() => {
    // Fetch custom templates
    async function fetchCustomTemplates() {
      try {
        const { data, error } = await supabase
          .from('scoring_templates')
          .select('*')
          .not('created_by', 'is', null);
        
        if (error) throw error;
        
        setTemplates([...DEFAULT_TEMPLATES, ...(data || [])]);
      } catch (error) {
        console.error('Error fetching custom templates:', error);
        addToast('Failed to load custom templates', 'error');
      }
    }

    fetchCustomTemplates();
  }, []);

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

  const handleRosterChange = (position: keyof typeof DEFAULT_ROSTER, value: number) => {
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

  const handleTemplateChange = (value: string | number) => {
    const template = templates.find(t => t.id === value);
    if (!template) return;

    setSelectedTemplate(template.id);
    setFormData(prev => ({
      ...prev,
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

  const handleResetRoster = () => {
    setFormData(prev => ({
      ...prev,
      roster: { ...DEFAULT_ROSTER }
    }));
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName.trim()) {
      addToast('Please enter a template name', 'error');
      return;
    }

    try {
      setIsSavingTemplate(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        addToast('You must be logged in to save templates', 'error');
        return;
      }

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

      const templateValues = Object.fromEntries(
        Object.entries(formData.scoring).map(([key, value]) => [key, value === 0 ? null : value])
      );

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
      const { data, error } = await supabase
        .from('scoring_templates')
        .select('*')
        .not('created_by', 'is', null);
      
      if (error) throw error;
      setTemplates([...DEFAULT_TEMPLATES, ...(data || [])]);
    } catch (error) {
      console.error('Error saving template:', error);
      addToast('Failed to save template', 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (template: ScoringTemplate) => {
    if (!template || !template.created_by) return;

    try {
      setIsDeletingTemplate(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        addToast('You must be logged in to delete templates', 'error');
        return;
      }

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
      const { data, error } = await supabase
        .from('scoring_templates')
        .select('*')
        .not('created_by', 'is', null);
      
      if (error) throw error;
      setTemplates([...DEFAULT_TEMPLATES, ...(data || [])]);
    } catch (error) {
      console.error('Error deleting template:', error);
      addToast('Failed to delete template', 'error');
    } finally {
      setIsDeletingTemplate(false);
      setTemplateToDelete(null);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('leagues')
        .update({
          name: formData.name,
          public: formData.public,
          scoring_type: formData.scoringType,
          num_teams: formData.teams,
          draft_type: formData.draftType,
          draft_date: formData.draftDate || null,
          roster_settings: formData.roster,
          dynasty_settings: formData.dynasty,
          scoring_settings: formData.scoring
        })
        .eq('id', leagueId);

      if (error) throw error;

      addToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

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
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public</span>
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
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value.slice(0, 24))}
                    className="w-64 max-w-full mt-2"
                    maxLength={24}
                  />
                  <Button
                    variant="affirmative"
                    size="sm"
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate || !newTemplateName.trim()}
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
              {Object.entries(formData.scoring).map(([key, value]) => (
                <NumberInput
                  key={`${key}-${selectedTemplate}`}
                  label={key.toUpperCase()}
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
                    <span className="text-sm font-medium">Must Have At Least 1 Active Roster Spot</span>
                  </div>
                ) : (formData.roster.pg + formData.roster.sg + formData.roster.sf + 
                  formData.roster.pf + formData.roster.c + formData.roster.g + 
                  formData.roster.f + formData.roster.gf + formData.roster.fc + 
                  formData.roster.util + formData.roster.bench) !== 15 && (
                  <div className="flex items-center gap-1.5 text-warning-500 dark:text-warning-600">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">15 Roster Spots Highly Recommended</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Active:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.roster.pg + formData.roster.sg + formData.roster.sf + 
                     formData.roster.pf + formData.roster.c + formData.roster.g + 
                     formData.roster.f + formData.roster.gf + formData.roster.fc + 
                     formData.roster.util}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Inactive:</span>
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
                    Reset
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
                  label={key.toUpperCase()}
                  value={value}
                  onChange={(value) => handleRosterChange(key as keyof typeof DEFAULT_ROSTER, value)}
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
                Dynasty League
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
                    label="Keepers"
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
                    label="Salary Increase"
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
                      Rookies Exempt From Salary Increase
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
            variant="affirmative"
            onClick={handleSaveSettings}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LeaguePage() {
  const { t } = useTranslations();
  const { id: leagueId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user has access to this league
  useEffect(() => {
    async function checkAccess() {
      try {
        setIsLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
          setError('You must be logged in to view leagues.');
        return;
      }

        // Try to fetch the league - RLS will prevent access if user is not a member
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select('id, name')
          .eq('id', leagueId)
          .single();

        if (leagueError || !leagueData) {
          setError('You do not have access to this league.');
        return;
      }

        // Check if user is admin
        const { data: memberData, error: memberError } = await supabase
          .from('league_members')
          .select('role')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .single();

        if (!memberError && memberData) {
          setIsAdmin(memberData.role === 'admin');
        }

        setError(null);
      } catch (err) {
        console.error('Error checking league access:', err);
        setError('An error occurred while checking league access.');
    } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [leagueId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('common.states.loadingLeague')}</p>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="text-error-500 mb-2">
            <svg className="h-8 w-8 mx-auto" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
              </div>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
            </div>
        </div>
    );
  }
  
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
      id: 'talk',
      label: t('common.tabs.talk'),
      content: <TalkTab />
    },
    {
      id: 'settings',
      label: t('common.tabs.settings'),
      content: <SettingsTab />
    }
  ];

  return (
    <div className="mx-auto px-8 py-6">
      <div className="relative">
        {isAdmin && (
          <div className="absolute right-0 -top-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const { data, error } = await supabase
                    .from('league_invites')
                    .insert({
                      league_id: leagueId
                    })
                    .select('code')
                    .single();

                  if (error) throw error;

                  await navigator.clipboard.writeText(data.code);
                  addToast(t('common.success.inviteCopied'), 'success');
                } catch (error) {
                  console.error('Error generating invite:', error);
                  addToast(t('common.errors.inviteGenerationFailed'), 'error');
                }
              }}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 8a1 1 0 100 2 1 1 0 000-2zM18 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('common.actions.inviteMember')}
            </Button>
            </div>
        )}

        <Tabs tabs={tabs} variant="default" />
            </div>
          </div>
  );
} 