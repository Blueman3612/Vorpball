'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { addToast, ToastContainer } from '@/components/ui/toast';
import { useTheme } from '@/components/ThemeProvider';
import { PencilIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';

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

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `public/${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(fileName);

      // Delete old profile picture if it exists
      if (profile?.avatar_url) {
        const oldFileName = profile.avatar_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('profile_pictures')
            .remove([`public/${oldFileName}`]);
        }
      }

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
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
    return <div className="p-8">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-8">No profile found.</div>;
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
                      alt={getValue('full_name') || 'Profile'}
                      fill
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
                aria-label="Change profile photo"
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
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Account Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={getValue('full_name') || ''}
                onChange={(e) => handleChange({ full_name: e.target.value })}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={getValue('username') || ''}
                onChange={(e) => handleChange({ username: e.target.value })}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={getValue('email') || ''}
                disabled
              />
            </div>

            {/* Save/Cancel Buttons */}
            {hasChanges && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-4 justify-end">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveChanges}
                  disabled={!hasChanges}
                  isLoading={saving}
                  variant="primary"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive email updates about your fantasy teams
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
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark theme
                </p>
              </div>
              <Toggle
                checked={theme === 'dark'}
                onChange={(checked) => updatePreference('dark_mode', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 