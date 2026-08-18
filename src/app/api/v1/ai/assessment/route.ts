import { NextRequest, NextResponse } from 'next/server';
import { aiFraudEngineService } from '@/modules/ai-engine';
import { handleApiError, ValidationError } from '@/lib/errors';
import { AIAssessmentTargetType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = (searchParams.get('targetType') || 'ENTITY') as AIAssessmentTargetType;
    const targetId = searchParams.get('targetId') || 'ENT-8821';

    let assessment;
    if (targetType === 'TRANSACTION') {
      assessment = await aiFraudEngineService.assessTransactionAI(targetId);
    } else if (targetType === 'ACCOUNT') {
      assessment = await aiFraudEngineService.assessAccountAI(targetId);
    } else {
      assessment = await aiFraudEngineService.assessEntityAI(targetId);
    }

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/assessment');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetType = (body?.targetType || 'ENTITY') as AIAssessmentTargetType;
    const targetId = body?.targetId;

    if (!targetId) {
      throw new ValidationError('Missing required body field: targetId');
    }

    let assessment;
    if (targetType === 'TRANSACTION') {
      assessment = await aiFraudEngineService.assessTransactionAI(targetId);
    } else if (targetType === 'ACCOUNT') {
      assessment = await aiFraudEngineService.assessAccountAI(targetId);
    } else {
      assessment = await aiFraudEngineService.assessEntityAI(targetId);
    }

    return NextResponse.json({
      success: true,
      message: `AI Assessment calculated and persisted for ${targetType} ${targetId}`,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/ai/assessment');
  }
}
