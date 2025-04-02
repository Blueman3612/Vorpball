import { InputHTMLAttributes, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showClearButton?: boolean;
  onClear?: () => void;
}

export function Input({
  className,
  label,
  error,
  helperText,
  type = 'text',
  required,
  disabled,
  value,
  defaultValue,
  placeholder,
  showClearButton = true,
  onClear,
  onChange,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value != null ? String(value).length > 0 : defaultValue != null;
  const showFloatingLabel = isFocused || hasValue || type === 'datetime-local';

  const handlePencilClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      const event = {
        target: {
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Clear button */}
        {showClearButton && hasValue && (
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
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={inputRef}
          type={type}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          placeholder={showFloatingLabel ? placeholder : ''}
          onChange={onChange}
          className={cn(
            'block w-full transition-all duration-200',
            'px-3 h-10',
            'bg-white dark:bg-gray-900',
            'text-gray-900 dark:text-white',
            'border rounded-lg text-sm',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            type !== 'datetime-local' && 'pr-10',
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-400/20'
              : cn(
                  'border-gray-300 dark:border-gray-700',
                  'hover:border-gray-400 dark:hover:border-gray-600',
                  'focus:border-primary-500 focus:ring-primary-400/20'
                ),
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {type !== 'datetime-local' && (
          <>
            {error ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePencilClick}
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2',
                  'p-1 rounded-md z-10',
                  'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-400/20',
                  disabled && 'pointer-events-none'
                )}
                tabIndex={-1}
                disabled={disabled}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
      {(error || helperText) && (
        <p 
          className={cn(
            'mt-1.5 text-sm',
            error ? 'text-error-500' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
} 