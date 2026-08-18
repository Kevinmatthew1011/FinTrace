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

    if (!body?.summary) {
      throw new ValidationError('Case closure summary is required.');
    }

    const dossier = await caseService.closeCase(id, body.summary, body.closedById);

    return NextResponse.json({
      success: true,
      message: 'Case closed successfully.',
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/close');
  }
}
