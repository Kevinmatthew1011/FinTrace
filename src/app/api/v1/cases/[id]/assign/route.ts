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

    if (!body?.userId) {
      throw new ValidationError('Missing required field: userId');
    }

    const dossier = await caseService.assignInvestigator(id, body.userId, body.actorUserId);

    return NextResponse.json({
      success: true,
      message: 'Investigator assigned successfully.',
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/assign');
  }
}
