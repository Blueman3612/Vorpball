import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn, getThemeColorClass } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'affirmative';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        // Base styles
        'rounded-lg font-medium transition-all duration-200 shadow-sm',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        // Size variants
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        // Color variants
        {
          // Primary
          [cn(
            getThemeColorClass('primary', 500, 'bg'),
            'text-white',
            `hover:${getThemeColorClass('primary', 600, 'bg')}`,
            `active:${getThemeColorClass('primary', 700, 'bg')}`,
            'focus:ring-primary-400',
            'disabled:bg-slate-100 disabled:text-slate-400',
            'dark:disabled:bg-slate-800 dark:disabled:text-slate-600',
            'shadow-primary-100 dark:shadow-none'
          )]: variant === 'primary',
          // Secondary
          [cn(
            getThemeColorClass('gray', 100, 'bg'),
            getThemeColorClass('gray', 700, 'text'),
            `hover:${getThemeColorClass('gray', 200, 'bg')}`,
            `active:${getThemeColorClass('gray', 300, 'bg')}`,
            'focus:ring-gray-300',
            'disabled:bg-slate-50 disabled:text-slate-300',
            'dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:active:bg-slate-500'
          )]: variant === 'secondary',
          // Outline
          [cn(
            'border border-slate-200 bg-transparent',
            getThemeColorClass('gray', 700, 'text'),
            'hover:bg-slate-50 active:bg-slate-100',
            'focus:ring-slate-300',
            'disabled:bg-transparent disabled:text-slate-300 disabled:border-slate-200',
            'dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-500 dark:active:bg-slate-600'
          )]: variant === 'outline',
          // Destructive
          [cn(
            getThemeColorClass('error', 500, 'bg'),
            'text-white',
            `hover:${getThemeColorClass('error', 600, 'bg')}`,
            `active:${getThemeColorClass('error', 700, 'bg')}`,
            'focus:ring-error-400',
            'disabled:bg-slate-100 disabled:text-slate-400',
            'dark:disabled:bg-slate-800 dark:disabled:text-slate-600',
            'shadow-error-100 dark:shadow-none'
          )]: variant === 'destructive',
          // Affirmative
          [cn(
            getThemeColorClass('success', 500, 'bg'),
            'text-gray-900 dark:text-white',
            `hover:${getThemeColorClass('success', 600, 'bg')}`,
            `active:${getThemeColorClass('success', 700, 'bg')}`,
            'focus:ring-success-400',
            'disabled:bg-slate-100 disabled:text-slate-400',
            'dark:disabled:bg-slate-800 dark:disabled:text-slate-600',
            'shadow-success-100 dark:shadow-none'
          )]: variant === 'affirmative',
        },
        'disabled:cursor-not-allowed disabled:transform-none',
        'hover:translate-y-[-1px] active:translate-y-[1px]',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}