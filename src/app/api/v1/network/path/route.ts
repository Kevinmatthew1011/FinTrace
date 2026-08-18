import { NextRequest, NextResponse } from 'next/server';
import { graphIntelligenceService } from '@/modules/graph';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const target = searchParams.get('target');

    if (!source || !target) {
      return NextResponse.json(
        { success: false, error: { message: 'Missing required query parameters: source and target' } },
        { status: 400 }
      );
    }

    const path = await graphIntelligenceService.findPath(source, target);

    return NextResponse.json({
      success: true,
      data: path,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/network/path');
  }
}
