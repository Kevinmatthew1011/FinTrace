import { NextResponse } from 'next/server';
import { dashboardService } from '@/modules/dashboard/dashboardService';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const data = await dashboardService.getDashboardSummary();
    return NextResponse.json({
      success: true,
      data: {
        summary: data.kpiSummary,
        riskDistribution: data.riskDistribution,
        regionalActivity: data.regionalActivity,
      },
      meta: data.meta,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/dashboard/summary');
  }
}
