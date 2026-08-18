import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dossier = await caseService.getCaseDossier(id);

    return NextResponse.json({
      success: true,
      data: dossier,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/cases/:id');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`Case not found: ${id}`);

    const updated = await prisma.case.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : existing.title,
        description: body.description !== undefined ? body.description : existing.description,
        priority: body.priority !== undefined ? body.priority : existing.priority,
        tags: body.tags !== undefined ? body.tags : existing.tags,
        findings: body.findings !== undefined ? body.findings : existing.findings,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Case ${updated.caseNumber} updated successfully`,
      data: await caseService.getCaseDossier(id),
    });
  } catch (error) {
    return handleApiError(error, 'PATCH /api/v1/cases/:id');
  }
}
