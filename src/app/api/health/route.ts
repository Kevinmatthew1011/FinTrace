import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  const timestamp = new Date().toISOString();
  logger.debug('HEALTH_CHECK', 'Health check requested');

  const dbStatus = await checkDatabaseConnection();
  const memory = process.memoryUsage();

  const healthPayload = {
    status: dbStatus.connected ? 'healthy' : 'degraded',
    service: 'FinTrace Intelligence API',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    timestamp,
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbStatus.connected,
      latencyMs: dbStatus.latencyMs ?? null,
      error: dbStatus.error ?? null,
    },
    system: {
      memoryUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      memoryTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      nodeVersion: process.version,
    },
  };

  return NextResponse.json(healthPayload, {
    status: dbStatus.connected ? 200 : 200, // Return 200 so UI can inspect health even before DB init
  });
}
