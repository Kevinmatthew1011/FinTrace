import { NextRequest, NextResponse } from 'next/server';
import { aiFraudEngineService } from '@/modules/ai-engine';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || 'ENT-8821'; // Default to Apex Logistics

    const assessment = await aiFraudEngineService.assessEntityAI(entityId);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/entity');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entityId = body?.entityId;

    if (!entityId) {
      throw new ValidationError('Missing required body parameter: entityId');
    }

    const assessment = await aiFraudEngineService.assessEntityAI(entityId);

    return NextResponse.json({
      success: true,
      message: `AI fraud assessment completed for entity ${entityId}`,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/ai/entity');
  }
}
