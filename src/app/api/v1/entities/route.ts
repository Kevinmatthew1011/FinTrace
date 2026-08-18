import { NextRequest, NextResponse } from 'next/server';
import { entityService } from '@/modules/entities/entityService';
import { handleApiError } from '@/lib/errors';
import { RiskLevel, EntityType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const riskLevel = (searchParams.get('riskLevel') as RiskLevel | 'ALL') || undefined;
    const entityType = (searchParams.get('entityType') as EntityType | 'ALL') || undefined;
    const jurisdiction = searchParams.get('jurisdiction') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25;

    const result = await entityService.getEntities({
      search,
      riskLevel,
      entityType,
      jurisdiction,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/entities');
  }
}
