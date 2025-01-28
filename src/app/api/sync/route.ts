import { NextResponse } from 'next/server';
import { syncAllPlayers, stopSync } from '@/lib/supabase/sync';

// Simple in-memory sync status tracking
let isSyncing = false;
let lastSyncTime: Date | null = null;
let lastSyncError: string | null = null;

export async function POST() {
  if (isSyncing) {
    return NextResponse.json(
      { 
        error: 'Sync already in progress',
        lastSyncTime: lastSyncTime?.toISOString(),
        lastSyncError
      },
      { status: 409 }
    );
  }

  try {
    isSyncing = true;
    console.log('Starting full data sync...');
    
    await syncAllPlayers();
    
    lastSyncTime = new Date();
    lastSyncError = null;
    
    return NextResponse.json({ 
      success: true,
      syncTime: lastSyncTime.toISOString()
    });
  } catch (error) {
    console.error('Sync error:', error);
    lastSyncError = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: lastSyncError },
      { status: 500 }
    );
  } finally {
    isSyncing = false;
  }
}

// Add a GET endpoint to check sync status
export async function GET() {
  return NextResponse.json({
    isSyncing,
    lastSyncTime: lastSyncTime?.toISOString() || null,
    lastSyncError
  });
}

// Add a DELETE endpoint to stop the sync
export async function DELETE() {
  if (!isSyncing) {
    return NextResponse.json(
      { error: 'No sync process is currently running' },
      { status: 400 }
    );
  }

  stopSync();
  return NextResponse.json({ 
    success: true,
    message: 'Sync process stop requested'
  });
} 