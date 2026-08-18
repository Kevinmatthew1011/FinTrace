import { NextRequest, NextResponse } from 'next/server';
import { caseService } from '@/modules/cases';
import { handleApiError, ValidationError } from '@/lib/errors';
import { CasePriority, CaseStatus, RiskLevel } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const priority = (searchParams.get('priority') as CasePriority | 'ALL') || undefined;
    const status = (searchParams.get('status') as CaseStatus | 'ALL') || undefined;
    const riskLevel = (searchParams.get('riskLevel') as RiskLevel | 'ALL') || undefined;
    const assignedToId = searchParams.get('assignedToId') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25;

    const result = await caseService.getCases({
      search,
      priority,
      status,
      riskLevel,
      assignedToId,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/cases');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If alertId is passed, use alert-to-case workflow
    if (body?.alertId) {
      const result = await caseService.createCaseFromAlert(body.alertId, body.investigatorId);
      return NextResponse.json({
        success: true,
        isExisting: result.isExisting,
        message: result.message,
        data: result.case,
      });
    }

    // Manual case creation
    if (!body?.title || !body?.description) {
      throw new ValidationError('Case title and description are required.');
    }

    const newCase = await caseService.createCase({
      title: body.title,
      description: body.description,
      priority: body.priority,
      primaryEntityId: body.primaryEntityId,
      assignedToId: body.assignedToId,
      tags: body.tags,
    });

    return NextResponse.json({
      success: true,
      message: 'Investigation case successfully created.',
      data: newCase,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases');
  }
}
