import { NextRequest, NextResponse } from 'next/server';
import { riskEngineService } from '@/modules/risk-engine';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId') || 'ACC-HDFC-9912';

    const assessment = await riskEngineService.assessAccount(accountId);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/risk/account');
  }
}
