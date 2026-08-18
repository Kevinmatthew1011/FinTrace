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

    if (!body?.priority) {
      throw new ValidationError('Missing required field: priority');
    }

    const dossier = await caseService.updateCasePriority(
      id,
      body.priority as CasePriority,
      body.actorUserId
    );

    return NextResponse.json({
      success: true,
      message: `Case priority updated to ${body.priority}`,
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/priority');
  }
}
