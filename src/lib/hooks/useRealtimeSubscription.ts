import { useEffect, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

type PostgresChangesPayload<T> = {
  new: T;
  old: T;
  errors: unknown;
  schema: string;
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  commit_timestamp: string;
};

type PresenceState<T> = Record<string, T[]>;

type SubscriptionConfig<T extends { [key: string]: any }> = {
  channel: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table?: string;
  filter?: string;
  callback: (payload: PostgresChangesPayload<T>) => void;
};

type PresenceConfig<T extends { [key: string]: any }> = {
  channel: string;
  event?: 'sync' | 'join' | 'leave';
  callback: (payload: PresenceState<T> | null) => void;
};

export function useRealtimeSubscription<T extends { [key: string]: any }>(
  config: SubscriptionConfig<T> | PresenceConfig<T>,
  deps: any[] = []
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(config.channel);
    channelRef.current = channel;

    // Handle database changes subscription
    if ('table' in config) {
      channel.on(
        'postgres_changes' as any,
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter
        },
        (payload: unknown) => (config as SubscriptionConfig<T>).callback(payload as PostgresChangesPayload<T>)
      );
    }
    // Handle presence subscription
    else {
      channel.on(
        'presence' as any,
        { event: config.event || 'sync' },
        ({ event, payload }: { event: 'sync' | 'join' | 'leave', payload: Record<string, any> | null }) => {
          if (event === config.event || config.event === undefined) {
            (config as PresenceConfig<T>).callback(payload as PresenceState<T> | null);
          }
        }
      );
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // If this is a presence channel, we might want to track presence here
        if (!('table' in config) && channelRef.current) {
          // Don't automatically track for presence channels
          // Let the consumer handle tracking
        }
      }
    });

    return () => {
      if (channelRef.current) {
        // If this is a presence channel, untrack before unsubscribing
        if (!('table' in config)) {
          channelRef.current.untrack?.().catch(console.error);
        }
        channelRef.current.unsubscribe();
      }
    };
  }, [config.channel, ...deps]);

  return channelRef.current;
} 