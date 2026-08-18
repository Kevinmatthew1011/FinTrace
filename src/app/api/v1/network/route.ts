import { NextRequest, NextResponse } from 'next/server';
import { graphIntelligenceService } from '@/modules/graph';
import { handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId') || 'ENT-8821'; // Default root is Apex Logistics
    const depth = searchParams.get('depth') ? parseInt(searchParams.get('depth')!, 10) : 2;

    const graph = await graphIntelligenceService.getNetworkGraph(entityId, depth);

    return NextResponse.json({
      success: true,
      data: graph,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/network');
  }
}
