import { NextRequest, NextResponse } from 'next/server';
import { intelligenceService } from '@/modules/intelligence';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId, question, customQuery, actorUserId } = body || {};

    if (!caseId) {
      throw new ValidationError('Missing required parameter: caseId');
    }

    if (!question && !customQuery) {
      throw new ValidationError('Missing required parameter: question or customQuery');
    }

    const response = await intelligenceService.askAssistant(
      caseId,
      question || 'General Inquiry',
      customQuery,
      actorUserId
    );

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/ai/assistant');
  }
}
