import { useEffect, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface SubscriptionConfig<T extends Record<string, unknown>> {
  channel: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useRealtimeSubscription<T extends Record<string, unknown>>(
  config: SubscriptionConfig<T>,
  deps: React.DependencyList = []
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const channel = supabase.channel(config.channel);
    
    channel.on(
      'postgres_changes' as unknown as 'system',
      {
        event: config.event,
        schema: 'public',
        table: config.table,
        filter: config.filter,
      },
      (payload: RealtimePostgresChangesPayload<T>) => {
        configRef.current.callback(payload);
      }
    )
    .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.channel, config.event, config.table, config.filter, ...deps]);

  return channelRef.current;
} 