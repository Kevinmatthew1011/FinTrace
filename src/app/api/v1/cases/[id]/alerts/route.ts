import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body?.alertId) {
      throw new ValidationError('Missing required field: alertId');
    }

    const dossier = await caseService.attachAlertToCase(id, body.alertId, body.actorUserId);

    return NextResponse.json({
      success: true,
      message: 'Alert attached to case successfully.',
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/alerts');
  }
}
