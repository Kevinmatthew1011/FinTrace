import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/modules/search/searchService';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 5;

    const results = await searchService.searchAll(q, limit);

    return NextResponse.json({
      success: true,
      query: q,
      data: results,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/search');
  }
}
