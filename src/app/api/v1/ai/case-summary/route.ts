import { NextRequest, NextResponse } from 'next/server';
import { intelligenceService } from '@/modules/intelligence';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId } = body || {};

    if (!caseId) {
      throw new ValidationError('Missing required parameter: caseId');
    }

    const summary = await intelligenceService.summarizeCase(caseId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/ai/case-summary');
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      throw new ValidationError('Missing required query parameter: caseId');
    }

    const summary = await intelligenceService.summarizeCase(caseId);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/ai/case-summary');
  }
}
