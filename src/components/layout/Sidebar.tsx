'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  UsersIcon, 
  ChartBarIcon, 
  TrophyIcon,
  UserCircleIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '../ThemeToggle';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'My Teams', href: '/teams', icon: UsersIcon },
  { name: 'Players', href: '/players', icon: TableCellsIcon },
  { name: 'League', href: '/league', icon: TrophyIcon },
  { name: 'Stats & Analysis', href: '/stats', icon: ChartBarIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen flex-col justify-between border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-10 w-10 rounded-lg bg-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Fantasy Basketball</span>
          </Link>
          <ThemeToggle />
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
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2">
          <img
            alt="User"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
} 