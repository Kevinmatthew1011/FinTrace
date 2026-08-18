export interface RiskScoreBreakdown {
  overallScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    velocityFactor: number;
    amountAnomalyFactor: number;
    networkCentralityFactor: number;
    counterpartyRiskFactor: number;
    muleProximityFactor: number;
  };
  triggeredRules: string[];
}

export interface IRiskEngineService {
  calculateEntityRisk(entityId: string): Promise<RiskScoreBreakdown>;
  scoreTransaction(txId: string): Promise<{ score: number; flagged: boolean; reasons: string[] }>;
}

export class RiskEngineServiceStub implements IRiskEngineService {
  async calculateEntityRisk(_entityId: string): Promise<RiskScoreBreakdown> {
    return {
      overallScore: 84.5,
      riskLevel: 'HIGH',
      factors: {
        velocityFactor: 88,
        amountAnomalyFactor: 76,
        networkCentralityFactor: 92,
        counterpartyRiskFactor: 80,
        muleProximityFactor: 86,
      },
      triggeredRules: [
        'High Velocity 24h Outflow > 85%',
        'Structuring beneath INR 50,000 threshold',
        'Direct connection to 2+ flagged mule accounts',
      ],
    };
  }

  async scoreTransaction(_txId: string) {
    return {
      score: 78,
      flagged: true,
      reasons: ['Sudden burst transfer from recently activated account'],
    };
  }
}

export const riskEngineService = new RiskEngineServiceStub();
