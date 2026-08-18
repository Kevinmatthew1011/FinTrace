import { NextRequest, NextResponse } from 'next/server';
import { aiFraudEngineService } from '@/modules/ai-engine';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || 'ENT-8821';

    const result = await aiFraudEngineService.assessNetworkAI(entityId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/network');
  }
}
