'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(updates: Partial<Profile>) {
    setUnsavedChanges(prev => ({ ...prev, ...updates }));
  }

  // Helper function to get the current value (either unsaved or saved)
  function getValue<K extends keyof Profile>(key: K): Profile[K] | null {
    if (key in unsavedChanges) {
      return unsavedChanges[key] as Profile[K];
    }
    return profile?.[key] ?? null;
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-8">No profile found.</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>
        <Button
          onClick={saveChanges}
          disabled={!hasChanges}
          isLoading={saving}
          variant="primary"
        >
          Save Changes
        </Button>
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {getValue('avatar_url') ? (
              <img 
                src={getValue('avatar_url') || ''} 
                alt={getValue('full_name') || 'Profile'} 
                className="h-20 w-20 rounded-full object-cover" 
              />
            ) : (
              <span className="text-2xl text-gray-500 dark:text-gray-400">
                {getValue('full_name')?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{getValue('full_name')}</h2>
            <p className="text-gray-500 dark:text-gray-400">{getValue('email')}</p>
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => {/* TODO: Implement avatar upload */}}
            >
              Change profile photo
            </Button>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
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

          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Zone
            </label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={getValue('timezone') || 'UTC'}
              onChange={(e) => handleChange({ timezone: e.target.value })}
            >
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
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
              checked={getValue('email_notifications') || false}
              onChange={(checked) => handleChange({ email_notifications: checked })}
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
              checked={getValue('dark_mode') || false}
              onChange={(checked) => handleChange({ dark_mode: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 