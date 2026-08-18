import { NextResponse } from 'next/server';
import { riskEngineService } from '@/modules/risk-engine';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const overview = await riskEngineService.getRiskOverview();
    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/risk/overview');
  }
}
