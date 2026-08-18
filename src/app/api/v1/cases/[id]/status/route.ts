import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError, ValidationError } from '@/lib/errors';
import { CaseStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body?.status) {
      throw new ValidationError('Missing required field: status');
    }

    const dossier = await caseService.updateCaseStatus(
      id,
      body.status as CaseStatus,
      body.reason,
      body.actorUserId
    );

    return NextResponse.json({
      success: true,
      message: `Case status updated to ${body.status}`,
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/status');
  }
}
