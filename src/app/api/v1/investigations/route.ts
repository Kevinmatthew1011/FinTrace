import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases/caseService';
import { handleApiError } from '@/lib/errors';
import { CasePriority, CaseStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const priority = (searchParams.get('priority') as CasePriority | 'ALL') || undefined;
    const status = (searchParams.get('status') as CaseStatus | 'ALL') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25;

    const result = await caseService.getCases({
      search,
      priority,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/investigations');
  }
}
