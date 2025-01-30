'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: string | null;
  lastSyncError: string | null;
}

export default function SyncPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/sync');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sync status');
    }
  };

  useEffect(() => {
    fetchStatus();

    // Set up SSE connection
    const events = new EventSource('/api/sync/events');

    events.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        setLogs(prev => [...prev, data.message]);
      } else if (data.type === 'status') {
        setStatus(data.status);
      }
    };

    events.onerror = () => {
      events.close();
    };

    return () => {
      events.close();
    };
  }, []);

  const startSync = async () => {
    try {
      setError(null);
      setLogs([]);
      const response = await fetch('/api/sync', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start sync');
      }
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start sync');
    }
  };

  const stopSync = async () => {
    try {
      setError(null);
      const response = await fetch('/api/sync', { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to stop sync');
      }
      fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop sync');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">NBA Data Sync</h1>
      
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Sync Status</h2>
            <p className="text-gray-600">
              Status: <span className="font-medium">{status?.isSyncing ? 'Running' : 'Idle'}</span>
            </p>
            {status?.lastSyncTime && (
              <p className="text-gray-600">
                Last Sync: <span className="font-medium">{new Date(status.lastSyncTime).toLocaleString()}</span>
              </p>
            )}
          </div>
          <div>
            {status?.isSyncing ? (
              <Button onClick={stopSync} variant="destructive">
                Stop Sync
              </Button>
            ) : (
              <Button onClick={startSync}>
                Start Sync
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {status?.lastSyncError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
            Last Error: {status.lastSyncError}
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Sync Logs</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="text-gray-600 dark:text-gray-400">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Click &quot;Start Sync&quot; to begin syncing NBA player data</li>
          <li>The sync process will fetch active players and their current season statistics</li>
          <li>You can stop the sync process at any time by clicking &quot;Stop Sync&quot;</li>
          <li>Sync logs will appear in real-time below the status</li>
        </ul>
      </Card>
    </div>
  );
} 