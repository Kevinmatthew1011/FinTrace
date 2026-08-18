import { NextRequest, NextResponse } from 'next/server';
import { riskEngineService } from '@/modules/risk-engine';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId') || 'TXN-CIRC-1021';

    const assessment = await riskEngineService.assessTransaction(transactionId);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/risk/transaction');
  }
}
