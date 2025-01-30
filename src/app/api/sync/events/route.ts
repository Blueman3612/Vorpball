import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const encoder = new TextEncoder();
  let isConnected = true;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial message
      controller.enqueue(encoder.encode('event: sync\ndata: {"type":"connected"}\n\n'));

      // Keep connection alive with less frequent pings
      const keepAlive = setInterval(() => {
        if (isConnected) {
          try {
            controller.enqueue(encoder.encode('event: ping\ndata: ping\n\n'));
          } catch {
            console.error('Error sending ping, closing connection');
            clearInterval(keepAlive);
            isConnected = false;
            try {
              controller.close();
            } catch {
              // Ignore close errors
            }
          }
        }
      }, 5000);

      return () => {
        isConnected = false;
        clearInterval(keepAlive);
      };
    },
    cancel() {
      isConnected = false;
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 