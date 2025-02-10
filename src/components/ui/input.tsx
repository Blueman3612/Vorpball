import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  className,
  label,
  error,
  type = 'text',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          'w-full px-4 py-2',
          'bg-white dark:bg-gray-900',
          'text-gray-900 dark:text-white',
          'border border-gray-300 dark:border-gray-700',
          'rounded-lg',
          'focus:outline-none focus:ring-2',
          'focus:ring-primary-400 dark:focus:ring-primary-400',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-error-500 focus:ring-error-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
    </div>
  );
} 