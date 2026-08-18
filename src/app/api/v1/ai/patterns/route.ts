import { NextResponse } from 'next/server';
import { aiFraudEngineService } from '@/modules/ai-engine';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const patterns = await aiFraudEngineService.getDiscoveredPatterns();

    return NextResponse.json({
      success: true,
      data: patterns,
      count: patterns.length,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/patterns');
  }
}
