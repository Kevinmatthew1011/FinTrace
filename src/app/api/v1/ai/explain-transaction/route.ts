import { NextRequest, NextResponse } from 'next/server';
import { intelligenceService } from '@/modules/intelligence';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body || {};

    if (!transactionId) {
      throw new ValidationError('Missing required parameter: transactionId');
    }

    const explanation = await intelligenceService.explainTransaction(transactionId);

    return NextResponse.json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/ai/explain-transaction');
  }
}
