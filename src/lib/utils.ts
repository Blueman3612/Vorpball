import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NBA CDN URL for player headshots
export const NBA_CDN_URL = 'https://cdn.nba.com/headshots/nba/latest/1040x760';

export function getPlayerImageUrl(firstName: string, lastName: string, playerId: number, profile_picture_url?: string): string {
  // If we have a stored image URL in Supabase, use that
  if (profile_picture_url) {
    return profile_picture_url;
  }

  // Otherwise fall back to NBA CDN using the player's ID directly
  return `${NBA_CDN_URL}/${playerId}.png`;
} 