import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError, ValidationError } from '@/lib/errors';
import { EvidenceType, RiskLevel } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body?.title || !body?.description) {
      throw new ValidationError('Evidence title and description are required.');
    }

    const result = await caseService.addEvidence(id, {
      evidenceType: (body.evidenceType as EvidenceType) || 'SYSTEM_FINDING',
      title: body.title,
      description: body.description,
      source: body.source || 'MANUAL',
      sourceId: body.sourceId,
      severity: (body.severity as RiskLevel) || 'LOW',
      metadata: body.metadata,
      createdById: body.createdById,
    });

    return NextResponse.json({
      success: true,
      isDuplicate: result.isDuplicate,
      message: result.message,
      data: result.evidence,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/evidence');
  }
}
