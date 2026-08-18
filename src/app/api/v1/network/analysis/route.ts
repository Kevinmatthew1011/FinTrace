import { NextRequest, NextResponse } from 'next/server';
import { graphIntelligenceService } from '@/modules/graph';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || 'ENT-8821';

    const analysis = await graphIntelligenceService.analyzeEntityNetwork(entityId);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message && err.message.includes('Entity not found')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ENTITY_NOT_FOUND',
            message: err.message,
          },
        },
        { status: 404 }
      );
    }
    return handleApiError(error, 'GET /api/v1/network/analysis');
  }
}
