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
    // Log debugging information
    console.log(`Setting up ${config.event} subscription for ${config.table}`, {
      channel: config.channel,
      filter: config.filter
    });
    
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
        console.log(`Received ${config.event} event for ${config.table}:`, payload);
        configRef.current.callback(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Channel ${config.channel} subscription status:`, status);
    });

    channelRef.current = channel;

    return () => {
      console.log(`Cleaning up subscription for ${config.channel}`);
      channel.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.channel, config.event, config.table, config.filter, ...deps]);

  return channelRef.current;
} 