import { NextRequest, NextResponse } from 'next/server';
import { aiFraudEngineService } from '@/modules/ai-engine';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      throw new ValidationError('Missing required query parameter: accountId');
    }

    const assessment = await aiFraudEngineService.assessAccountAI(accountId);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/account');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body?.accountId;

    if (!accountId) {
      throw new ValidationError('Missing required body parameter: accountId');
    }

    const assessment = await aiFraudEngineService.assessAccountAI(accountId);

    return NextResponse.json({
      success: true,
      message: `AI fraud assessment completed for account ${accountId}`,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/ai/account');
  }
}
