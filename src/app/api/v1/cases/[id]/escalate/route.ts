import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError, ValidationError } from '@/lib/errors';
import { CasePriority } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body?.reason) {
      throw new ValidationError('Escalation reason is required.');
    }

    const dossier = await caseService.escalateCase(
      id,
      body.reason,
      body.priority as CasePriority | undefined,
      body.actorUserId
    );

    return NextResponse.json({
      success: true,
      message: 'Case escalated successfully.',
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/escalate');
  }
}
