import { NextRequest, NextResponse } from 'next/server';
import { graphIntelligenceService } from '@/modules/graph';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || undefined;

    const cycles = await graphIntelligenceService.detectCycles(entityId);

    return NextResponse.json({
      success: true,
      data: cycles,
      count: cycles.length,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/network/cycles');
  }
}
