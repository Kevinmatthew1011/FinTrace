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

    if (!body?.content || !body.content.trim()) {
      throw new ValidationError('Note content cannot be empty.');
    }

    const note = await caseService.addNote(id, {
      content: body.content,
      authorId: body.authorId,
      authorName: body.authorName,
      isSystemGenerated: body.isSystemGenerated ?? false,
    });

    return NextResponse.json({
      success: true,
      message: 'Note added successfully.',
      data: note,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/v1/cases/:id/notes');
  }
}
