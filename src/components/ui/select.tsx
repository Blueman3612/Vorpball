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
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);
  const showFloatingLabel = isFocused || value != null;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
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
            setIsFocused(false);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setIsFocused(false);
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
      <div className="relative" ref={containerRef}>
        {label && (
          <label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none',
              'origin-left',
              showFloatingLabel
                ? '-top-5 text-sm text-primary-600 dark:text-primary-400'
                : 'top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400',
              error && '!text-error-500',
              disabled && 'text-gray-400 dark:text-gray-500'
            )}
          >
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setIsOpen(prev => !prev);
              setIsFocused(true);
            }
          }}
          onBlur={() => {
            if (!isOpen) {
              setIsFocused(false);
            }
          }}
          className={cn(
            'w-full px-3 h-10',
            'bg-white dark:bg-gray-900',
            'text-left text-gray-900 dark:text-white',
            'border rounded-lg',
            'focus:outline-none focus:ring-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            'flex items-center justify-between',
            error
              ? 'border-error-500 focus:ring-error-400/20'
              : cn(
                  'border-gray-300 dark:border-gray-700',
                  'hover:border-gray-400 dark:hover:border-gray-600',
                  'focus:border-primary-500 focus:ring-primary-400/20'
                ),
            className
          )}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className={cn(
            "block truncate",
            !selectedOption?.label && "text-gray-500"
          )}>
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
                  'px-3 py-2 cursor-pointer',
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
                  setIsFocused(false);
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
        <p className="mt-1.5 text-sm text-error-500">{error}</p>
      )}
    </div>
  );
} 