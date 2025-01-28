import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg shadow-md',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
); 