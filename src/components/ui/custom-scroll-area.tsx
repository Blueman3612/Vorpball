import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

interface CustomScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const CustomScrollArea = forwardRef<HTMLDivElement, CustomScrollAreaProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-y-auto',
          '[--scrollbar-width:12px]',
          '[--scrollbar-track-bg:transparent]',
          '[--scrollbar-thumb-bg:rgb(203_213_225/0.4)]', // gray-300 with opacity
          'dark:[--scrollbar-thumb-bg:rgb(51_65_85/0.4)]', // dark:gray-700 with opacity
          'hover:[--scrollbar-thumb-bg:rgb(148_163_184/0.4)]', // gray-400 with opacity
          'dark:hover:[--scrollbar-thumb-bg:rgb(71_85_105/0.4)]', // dark:gray-600 with opacity
          '[&::-webkit-scrollbar]:w-[var(--scrollbar-width)]',
          '[&::-webkit-scrollbar]:h-[var(--scrollbar-width)]',
          '[&::-webkit-scrollbar-track]:bg-[var(--scrollbar-track-bg)]',
          '[&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb-bg)]',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb]:border-[2px]',
          '[&::-webkit-scrollbar-thumb]:border-solid',
          '[&::-webkit-scrollbar-thumb]:border-transparent',
          '[&::-webkit-scrollbar-thumb]:bg-clip-padding',
          'scrollbar-thin scrollbar-track-transparent',
          'firefox:scrollbar-width-thin',
          'firefox:scrollbar-color-[var(--scrollbar-thumb-bg)_var(--scrollbar-track-bg)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CustomScrollArea.displayName = 'CustomScrollArea'; 