import { useEffect, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface SubscriptionConfig<T extends Record<string, any>> {
  channel: string;
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useRealtimeSubscription<T extends Record<string, any>>(
  config: SubscriptionConfig<T>,
  deps: React.DependencyList = []
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const channel = supabase.channel(configRef.current.channel);
    
    channel.on(
      'postgres_changes' as unknown as 'system',
      {
        event: configRef.current.event,
        schema: 'public',
        table: configRef.current.table,
        filter: configRef.current.filter,
      },
      (payload: unknown) => configRef.current.callback(payload as RealtimePostgresChangesPayload<T>)
    )
    .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, deps);

  return channelRef.current;
} 