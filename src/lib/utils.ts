import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { theme, type ThemeColors, type ColorShade } from './theme';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getThemeColor(color: ThemeColors, shade: ColorShade) {
  return theme.colors[color][shade as keyof (typeof theme.colors)[ThemeColors]];
}

export function getThemeColorClass(
  color: ThemeColors,
  shade: ColorShade,
  prefix: 'bg' | 'text' | 'border' = 'bg'
) {
  return `${prefix}-${color}-${shade}`;
}

// Example usage:
// getThemeColorClass('primary', 600, 'bg') => 'bg-primary-600'
// getThemeColorClass('error', 500, 'text') => 'text-error-500' 