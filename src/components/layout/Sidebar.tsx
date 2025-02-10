'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  ChartBarIcon, 
  TrophyIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useTranslations, MessageKeys } from '@/lib/i18n';

interface Profile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface NavigationItem {
  name: MessageKeys;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavigationItem[] = [
  { name: 'common.navigation.league', href: '/league', icon: TrophyIcon },
  { name: 'common.navigation.myTeams', href: '/teams', icon: UsersIcon },
  { name: 'common.navigation.players', href: '/players', icon: TableCellsIcon },
  { name: 'common.navigation.statsAndAnalysis', href: '/stats', icon: ChartBarIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { t } = useTranslations();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    async function getProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    getProfile();
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col justify-between border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-10 w-10 rounded-lg bg-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Fantasy Basketball</span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                      ${isActive 
                        ? 'bg-gray-50 dark:bg-gray-800 text-blue-600' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {t(item.name)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <Link
          href="/profile"
          className="flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2"
        >
          <div className="relative h-10 w-10 flex-shrink-0">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || t('common.navigation.viewProfile')}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  {(profile?.full_name || profile?.username || 'U').charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {profile?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('common.navigation.viewProfile')}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
} 