'use client';

import { cn } from '@/lib/utils';
import { ReactNode, useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  variant?: 'default' | 'pills';
  size?: 'sm' | 'md' | 'lg';
}

export function Tabs({
  tabs,
  defaultTab,
  className,
  variant = 'default',
  size = 'md',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className={cn(
        'flex',
        {
          'border-b border-gray-200 dark:border-gray-800': variant === 'default',
          'p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg': variant === 'pills',
        }
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'relative font-medium transition-all duration-200',
              // Size variants
              {
                'px-3 py-2 text-sm': size === 'sm',
                'px-4 py-2': size === 'md',
                'px-6 py-3 text-lg': size === 'lg',
              },
              // Default variant styles
              variant === 'default' && [
                'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
                activeTab === tab.id && [
                  'text-primary-600 dark:text-primary-400',
                  'after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5',
                  'after:bg-primary-600 dark:after:bg-primary-400',
                ],
              ],
              // Pills variant styles
              variant === 'pills' && [
                'rounded-md',
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              ]
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="w-full">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
} 