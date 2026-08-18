import { NextRequest, NextResponse } from 'next/server';
import { aiFraudEngineService } from '@/modules/ai-engine';
import { handleApiError } from '@/lib/errors';
import { AIAssessmentTargetType, AIClassification } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType') as AIAssessmentTargetType | undefined;
    const targetId = searchParams.get('targetId') || undefined;
    const classification = searchParams.get('classification') as AIClassification | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25;

    const history = await aiFraudEngineService.getAIHistory({
      targetType,
      targetId,
      classification,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/history');
  }
}
