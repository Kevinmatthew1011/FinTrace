import { NextRequest, NextResponse } from 'next/server';
import { transactionService } from '@/modules/transactions/transactionService';
import { handleApiError } from '@/lib/errors';
import { RiskLevel, TransactionChannel, TransactionStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const riskLevel = (searchParams.get('riskLevel') as RiskLevel | 'ALL') || undefined;
    const status = (searchParams.get('status') as TransactionStatus | 'ALL') || undefined;
    const channel = (searchParams.get('channel') as TransactionChannel | 'ALL') || undefined;
    const minAmount = searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined;
    const maxAmount = searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25;
    const sortBy = (searchParams.get('sortBy') as 'timestamp' | 'amount' | 'riskScore') || 'timestamp';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const result = await transactionService.getTransactions({
      search,
      riskLevel,
      status,
      channel,
      minAmount,
      maxAmount,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error, 'GET /api/v1/transactions');
  }
}
