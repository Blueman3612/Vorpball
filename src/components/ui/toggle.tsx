interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}: ToggleProps) {
  const sizes = {
    sm: {
      toggle: 'h-5 w-9',
      circle: 'h-4 w-4',
      translate: 'translate-x-4',
    },
    md: {
      toggle: 'h-6 w-11',
      circle: 'h-5 w-5',
      translate: 'translate-x-5',
    },
    lg: {
      toggle: 'h-7 w-14',
      circle: 'h-6 w-6',
      translate: 'translate-x-7',
    },
  };

  return (
    <button
      type="button"
      className={`relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed ${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50' : ''} ${sizes[size].toggle} ${className}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? sizes[size].translate : 'translate-x-0'
        } ${sizes[size].circle}`}
      />
    </button>
  );
} 