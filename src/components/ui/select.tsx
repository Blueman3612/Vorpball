import { useEffect, useRef, useState } from 'react';
import { cn, getThemeColorClass } from '@/lib/utils';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'onChange'> {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
}

export function Select({
  className,
  label,
  options,
  value,
  onChange,
  error,
  disabled,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setHighlightedIndex(current => 
            current <= 0 ? options.length - 1 : current - 1
          );
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHighlightedIndex(current => 
            current >= options.length - 1 ? 0 : current + 1
          );
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isOpen) {
            onChange?.(options[highlightedIndex].value);
            setIsOpen(false);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, options, highlightedIndex, onChange]);

  return (
    <div className="w-full" {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div 
        ref={containerRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(prev => !prev)}
          className={cn(
            'w-full px-4 py-2',
            'bg-white dark:bg-gray-900',
            'text-left text-gray-900 dark:text-white',
            'border border-gray-300 dark:border-gray-700',
            'rounded-lg',
            'focus:outline-none focus:ring-2',
            'focus:ring-primary-400 dark:focus:ring-primary-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            'flex items-center justify-between',
            error && 'border-error-500 focus:ring-error-400',
            isOpen && 'ring-2 ring-primary-400',
            className
          )}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="block truncate">
            {selectedOption?.label || 'Select an option'}
          </span>
          <ChevronUpDownIcon 
            className={cn(
              'h-5 w-5 text-gray-400',
              'transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <ul
            className={cn(
              'absolute z-10 w-full mt-1',
              'max-h-60 overflow-auto',
              'bg-white dark:bg-gray-900',
              'border border-gray-200 dark:border-gray-700',
              'rounded-lg shadow-lg',
              'py-1',
              'focus:outline-none'
            )}
            tabIndex={-1}
            role="listbox"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                className={cn(
                  'px-4 py-2 cursor-pointer',
                  'text-gray-900 dark:text-white',
                  'hover:bg-primary-50 dark:hover:bg-primary-900/20',
                  'transition-colors duration-150',
                  'flex items-center justify-between',
                  index === highlightedIndex && 'bg-primary-50 dark:bg-primary-900/20',
                  option.value === value && 'font-medium text-primary-600 dark:text-primary-400'
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={option.value === value}
              >
                <span className="block truncate">
                  {option.label}
                </span>
                {option.value === value && (
                  <svg className="h-5 w-5 text-primary-600 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
    </div>
  );
} 