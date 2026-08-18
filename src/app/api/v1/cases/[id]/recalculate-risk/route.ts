import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const dossier = await caseService.recalculateCaseRisk(id, body?.actorUserId);

    return NextResponse.json({
      success: true,
      message: 'Case risk successfully recalculated using Multi-Factor & AI engines.',
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/recalculate-risk');
  }
}
