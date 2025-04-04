'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { addToast, ToastContainer } from '@/components/ui/toast';
import { useTheme } from '@/components/ThemeProvider';
import { PencilIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/lib/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Input } from '@/components/ui/input';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  timezone: string | null;
  email_notifications: boolean;
  dark_mode: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslations();

  const getProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setUnsavedChanges({});
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Update hasChanges whenever unsavedChanges changes
  useEffect(() => {
    setHasChanges(Object.keys(unsavedChanges).length > 0);
  }, [unsavedChanges]);

  async function saveChanges() {
    if (!hasChanges) return;

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(unsavedChanges)
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...unsavedChanges } : null);
      setUnsavedChanges({});
      addToast('Changes saved successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function updatePreference(key: 'email_notifications' | 'dark_mode', value: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, [key]: value } : null);
      
      // If this is a dark mode update, also update the theme
      if (key === 'dark_mode') {
        toggleTheme();
      }
      
      addToast('Preference updated');
    } catch (error) {
      console.error('Error updating preference:', error);
      addToast('Failed to update preference', 'error');
    }
  }

  function handleChange(updates: Partial<Profile>) {
    setUnsavedChanges(prev => ({ ...prev, ...updates }));
  }

  function handleCancel() {
    setUnsavedChanges({});
  }

  // Helper function to get the current value (either unsaved or saved)
  function getValue<K extends keyof Profile>(key: K): Profile[K] | null {
    if (key in unsavedChanges) {
      return unsavedChanges[key] as Profile[K];
    }
    return profile?.[key] ?? null;
  }

  async function handleProfilePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user logged in');

      // Use a consistent filename with jpg extension
      const filePath = `public/${user.id}.jpg`;

      // First, try to delete the existing file
      const { error: deleteError } = await supabase.storage
        .from('profile_pictures')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting existing profile picture:', deleteError);
      }

      // Wait a moment to ensure deletion is processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Upload the new file
      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, file, {
          cacheControl: 'no-cache',
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Add a timestamp to the URL to prevent caching
      const timestamp = Date.now();
      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(filePath);

      const urlWithTimestamp = `${publicUrl}?v=${timestamp}`;

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithTimestamp })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: urlWithTimestamp } : null);
      addToast('Profile photo updated successfully');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      addToast('Failed to update profile photo', 'error');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      addToast('Failed to sign out', 'error');
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.states.loading')}</div>;
  }

  if (!profile) {
    return <div className="p-8">{t('common.errors.noProfile')}</div>;
  }

  return (
    <div className="p-8">
      <ToastContainer />
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleProfilePhotoChange}
      />

      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {uploadingPhoto ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : null}
                {getValue('avatar_url') ? (
                  <div className="relative h-20 w-20">
                    <Image
                      src={getValue('avatar_url') || ''}
                      alt={getValue('full_name') || t('profile.title')}
                      fill
                      sizes="80px"
                      priority
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-2xl text-gray-500 dark:text-gray-400">
                    {getValue('full_name')?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('profile.sections.photo.changeLabel')}
              >
                <PencilIcon className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{getValue('full_name')}</h2>
              <p className="text-gray-500 dark:text-gray-400">{getValue('email')}</p>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 group relative"
            aria-label={t('common.actions.signOut')}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="sr-only">{t('common.actions.signOut')}</span>
            <span className="absolute hidden group-hover:block right-0 top-full mt-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap">
              {t('common.actions.signOut')}
            </span>
          </Button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Account Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('profile.sections.accountSettings.title')}
            </h3>
          </div>
          <div className="p-8 space-y-8">
            {/* Name */}
            <Input
              label={t('profile.sections.accountSettings.fields.fullName.label')}
              value={getValue('full_name') || ''}
              onChange={(e) => handleChange({ full_name: e.target.value })}
            />

            {/* Username */}
            <Input
              label={t('profile.sections.accountSettings.fields.username.label')}
              value={getValue('username') || ''}
              onChange={(e) => handleChange({ username: e.target.value })}
            />

            {/* Save/Cancel Buttons */}
            {hasChanges && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4 justify-end">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                >
                  {t('common.actions.cancel')}
                </Button>
                <Button
                  onClick={saveChanges}
                  disabled={!hasChanges}
                  isLoading={saving}
                  variant="affirmative"
                >
                  {saving ? t('common.actions.savingChanges') : t('common.actions.saveChanges')}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('profile.sections.preferences.title')}
            </h3>
          </div>
          <div className="p-8 space-y-8">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('profile.sections.preferences.emailNotifications.label')}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.sections.preferences.emailNotifications.description')}
                </p>
              </div>
              <Toggle
                checked={profile?.email_notifications || false}
                onChange={(checked) => updatePreference('email_notifications', checked)}
              />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('profile.sections.preferences.darkMode.label')}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('profile.sections.preferences.darkMode.description')}
                </p>
              </div>
              <Toggle
                checked={theme === 'dark'}
                onChange={(checked) => updatePreference('dark_mode', checked)}
              />
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('common.languages.title')}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.languages.description')}
                </p>
              </div>
              <div className="w-48">
                <LanguageSelector
                  currentLanguage="en"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 