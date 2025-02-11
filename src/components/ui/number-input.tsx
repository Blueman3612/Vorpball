import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}

export function NumberInput({
  className,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.05,
  error,
  disabled,
  required,
  ...props
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>(formatDisplayValue(value));
  const showFloatingLabel = isFocused || value !== 0;

  // Update inputValue when external value changes
  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatDisplayValue(value));
    }
  }, [value, isFocused]);

  // Format display value to remove trailing zeros
  function formatDisplayValue(num: number): string {
    return Number(num.toFixed(2)).toString();
  }

  // Get display value based on state
  function getDisplayValue(): string {
    if (!isFocused && value === 0) {
      return '';
    }
    return inputValue;
  }

  // Round to nearest step
  const roundToStep = (num: number) => {
    const rounded = Math.round(num / step) * step;
    return Number(Math.min(max, Math.max(min, rounded)).toFixed(2));
  };

  // Handle direct input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty input, minus sign, and valid numbers within range
    if (newValue === '' || 
        newValue === '-' || 
        (!isNaN(Number(newValue)) && Number(newValue) >= -100 && Number(newValue) <= 100)) {
      setInputValue(newValue);
    }
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputValue(value === 0 ? '' : formatDisplayValue(value));
    props.onFocus?.(e);
  };

  // Handle blur (unfocus)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    let newValue = inputValue === '' || inputValue === '-' ? 0 : parseFloat(inputValue);
    newValue = Math.min(100, Math.max(-100, newValue));
    const rounded = roundToStep(newValue);
    onChange(rounded);
    setInputValue(formatDisplayValue(rounded));
    props.onBlur?.(e);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Handle increment/decrement
  const handleIncrement = (increment: boolean) => {
    const currentValue = value === 100 && increment ? 100 : value === -100 && !increment ? -100 : value;
    const newValue = roundToStep(currentValue + (increment ? step : -step));
    onChange(newValue);
    setInputValue(formatDisplayValue(newValue));
  };

  // Handle clear
  const handleClear = () => {
    onChange(0);
    setInputValue('');
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Clear button */}
        {value !== 0 && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-2 -top-5 p-0.5 rounded-full z-10',
              'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-400/20'
            )}
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        )}

        {label && (
          <label
            className={cn(
              'absolute transition-all duration-200 pointer-events-none z-10',
              'origin-left',
              showFloatingLabel
                ? 'left-3 -top-5 text-sm text-primary-600 dark:text-primary-400'
                : 'left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400',
              error && '!text-error-500',
              disabled && 'text-gray-400 dark:text-gray-500'
            )}
          >
            <span className="text-center block">
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </span>
          </label>
        )}
        
        <div className="relative flex items-center">
          {/* Decrement button */}
          <button
            type="button"
            onClick={() => handleIncrement(false)}
            disabled={disabled || value <= min}
            className={cn(
              'absolute left-2 p-1 rounded-md',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            <MinusIcon className="h-4 w-4" />
          </button>

          {/* Number input */}
          <input
            type="text"
            inputMode="decimal"
            value={getDisplayValue()}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            maxLength={6}
            className={cn(
              'block w-full min-w-[180px] transition-all duration-200',
              'pl-8 pr-8 h-10',
              'bg-white dark:bg-gray-900',
              'text-gray-900 dark:text-white text-center',
              'border rounded-lg text-sm',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-error-500 focus:border-error-500 focus:ring-error-400/20'
                : cn(
                    'border-gray-300 dark:border-gray-700',
                    'hover:border-gray-400 dark:hover:border-gray-600',
                    'focus:border-primary-500 focus:ring-primary-400/20'
                  ),
              className
            )}
            {...props}
          />

          {/* Increment button */}
          <button
            type="button"
            onClick={() => handleIncrement(true)}
            disabled={disabled || value >= max}
            className={cn(
              'absolute right-2 p-1 rounded-md',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-sm text-error-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
} 