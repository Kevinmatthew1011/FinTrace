import { NextResponse } from 'next/server';
import {
  TRANSACTION_RISK_WEIGHTS,
  ENTITY_RISK_WEIGHTS,
  ACCOUNT_RISK_WEIGHTS,
  RISK_THRESHOLDS,
  RISK_ENGINE_VERSION,
} from '@/modules/risk-engine';

export async function GET() {
  return NextResponse.json({
    success: true,
    engineVersion: RISK_ENGINE_VERSION,
    thresholds: RISK_THRESHOLDS,
    weights: {
      transactionRisk: TRANSACTION_RISK_WEIGHTS,
      entityRisk: ENTITY_RISK_WEIGHTS,
      accountRisk: ACCOUNT_RISK_WEIGHTS,
    },
  });
}
