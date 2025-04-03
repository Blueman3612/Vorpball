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

export const NBA_CDN_URL = 'https://cdn.nba.com/headshots/nba/latest/1040x760';

export function getPlayerImageUrl(firstName: string, lastName: string, playerId: number, profilePictureUrl?: string): string {
  if (profilePictureUrl) return profilePictureUrl;
  return `${NBA_CDN_URL}/${playerId}.png`;
}

// Example usage:
// getThemeColorClass('primary', 600, 'bg') => 'bg-primary-600'
// getThemeColorClass('error', 500, 'text') => 'text-error-500' 