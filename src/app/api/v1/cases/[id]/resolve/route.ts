import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError, ValidationError } from '@/lib/errors';
import { CaseResolutionType } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body?.resolutionType || !body?.summary) {
      throw new ValidationError('Resolution type and summary are required.');
    }

    const dossier = await caseService.resolveCase(
      id,
      body.resolutionType as CaseResolutionType,
      body.summary,
      body.resolvedById
    );

    return NextResponse.json({
      success: true,
      message: `Case resolved as ${body.resolutionType}`,
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/resolve');
  }
}
