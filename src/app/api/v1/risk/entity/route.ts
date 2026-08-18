import { NextRequest, NextResponse } from 'next/server';
import { riskEngineService } from '@/modules/risk-engine';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || 'ENT-8821'; // Default Apex Logistics

    const assessment = await riskEngineService.assessEntity(entityId);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/risk/entity');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entityId = body?.entityId;

    if (!entityId) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required field: entityId' } },
        { status: 400 }
      );
    }

    const updatedAssessment = await riskEngineService.recalculateAndPersistEntityRisk(entityId);

    return NextResponse.json({
      success: true,
      message: `Risk score successfully recalculated and persisted for ${entityId}`,
      data: updatedAssessment,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/risk/entity');
  }
}
