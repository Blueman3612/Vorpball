'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  ChartBarIcon, 
  TrophyIcon,
  TableCellsIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useTranslations, MessageKeys } from '@/lib/i18n';
import { cn } from '@/lib/utils';

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
  { name: 'common.navigation.talk', href: '/talk', icon: ChatBubbleLeftRightIcon },
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
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', user?.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    if (user) {
      getProfile();
    }
  }, [user, loading, router]);

  return (
    <nav 
      className="group h-full bg-gray-900 transition-all duration-300 ease-in-out w-14 hover:w-56"
      style={{ willChange: 'width' }}
    >
      <div className="h-full flex flex-col">
        {/* App Logo/Title */}
        <Link 
          href="/dashboard" 
          className={cn(
            'p-3 flex items-center space-x-3 transition-all duration-200 rounded-md',
            'active:scale-95',
            pathname.startsWith('/dashboard')
              ? 'bg-gray-800 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          )}
        >
          <div className="min-w-[28px] h-8 bg-blue-600 rounded flex-shrink-0"></div>
          <div className="whitespace-nowrap overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
            <h1 className="text-white font-bold">VorpBall</h1>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center h-10 w-full',
                  'text-sm font-medium rounded-md transition-all duration-200',
                  'whitespace-nowrap overflow-hidden',
                  'active:scale-95',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <div className="w-14 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-4">
                  {t(item.name)}
                </span>
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <Link
          href="/profile"
          className={cn(
            'flex items-center h-16 w-full',
            'text-sm font-medium transition-all duration-200',
            'whitespace-nowrap overflow-hidden',
            'active:scale-95',
            pathname.startsWith('/profile')
              ? 'bg-gray-800 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          )}
        >
          <div className="w-14 flex items-center justify-center flex-shrink-0">
            <div className="relative w-8 h-8">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile?.username || 'User'}
                  fill
                  className="rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 rounded-full" />
              )}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>
          </div>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-4">
            {profile?.username || 'User'}
          </span>
        </Link>
      </div>
    </nav>
  );
} 