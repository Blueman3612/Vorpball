import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
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
      className={clsx(
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
          'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700 focus:ring-indigo-400 disabled:bg-slate-100 disabled:text-slate-400 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:active:bg-indigo-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 shadow-indigo-100 dark:shadow-none':
            variant === 'primary',
          // Secondary
          'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-300 disabled:bg-slate-50 disabled:text-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:active:bg-slate-500':
            variant === 'secondary',
          // Outline
          'border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-300 disabled:bg-transparent disabled:text-slate-300 disabled:border-slate-200 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-500 dark:active:bg-slate-600':
            variant === 'outline',
          // Destructive
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-400 disabled:bg-slate-100 disabled:text-slate-400 dark:bg-red-600 dark:hover:bg-red-500 dark:active:bg-red-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 shadow-red-100 dark:shadow-none':
            variant === 'destructive',
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