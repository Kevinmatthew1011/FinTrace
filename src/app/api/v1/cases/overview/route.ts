import { NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const overview = await caseService.getOverviewStats();

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/cases/overview');
  }
}
