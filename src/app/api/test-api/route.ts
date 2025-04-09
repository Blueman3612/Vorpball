import { testApiConnection } from '@/lib/balldontlie/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const success = await testApiConnection();
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error testing API:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
} 