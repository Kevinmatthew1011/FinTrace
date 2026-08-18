import { NextRequest, NextResponse } from 'next/server';
import { aiFraudEngineService } from '@/modules/ai-engine';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      throw new ValidationError('Missing required query parameter: transactionId');
    }

    const assessment = await aiFraudEngineService.assessTransactionAI(transactionId);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/transaction');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transactionId = body?.transactionId;

    if (!transactionId) {
      throw new ValidationError('Missing required body parameter: transactionId');
    }

    const assessment = await aiFraudEngineService.assessTransactionAI(transactionId);

    return NextResponse.json({
      success: true,
      message: `AI fraud assessment completed for transaction ${transactionId}`,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/ai/transaction');
  }
}
