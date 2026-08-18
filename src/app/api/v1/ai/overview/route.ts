import { NextResponse } from 'next/server';
import { aiFraudEngineService } from '@/modules/ai-engine';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const overview = await aiFraudEngineService.getAIOverview();

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/overview');
  }
}
