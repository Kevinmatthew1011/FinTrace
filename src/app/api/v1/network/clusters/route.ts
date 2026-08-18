import { NextResponse } from 'next/server';
import { graphIntelligenceService } from '@/modules/graph';
import { handleApiError } from '@/lib/errors';

export async function GET() {
  try {
    const clusters = await graphIntelligenceService.detectClusters();

    return NextResponse.json({
      success: true,
      data: clusters,
      count: clusters.length,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/network/clusters');
  }
}
