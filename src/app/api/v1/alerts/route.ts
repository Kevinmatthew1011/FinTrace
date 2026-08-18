import { NextRequest, NextResponse } from 'next/server';
import { alertService } from '@/modules/alerts/alertService';
import { handleApiError } from '@/lib/errors';
import { RiskLevel, AlertStatus, AlertType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const severity = (searchParams.get('severity') as RiskLevel | 'ALL') || undefined;
    const status = (searchParams.get('status') as AlertStatus | 'ALL') || undefined;
    const alertType = (searchParams.get('alertType') as AlertType | 'ALL') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25;

    const result = await alertService.getAlerts({
      search,
      severity,
      status,
      alertType,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/alerts');
  }
}
