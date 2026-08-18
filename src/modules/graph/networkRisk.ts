import { RiskLevel } from '@prisma/client';

export interface NetworkRiskFactors {
  cycleFactor: number;
  highRiskNeighborFactor: number;
  suspiciousPathFactor: number;
  velocityFactor: number;
  clusterFactor: number;
}

export class NetworkRiskScorer {
  calculateNetworkRisk(params: {
    hasCycles: boolean;
    cycleCount: number;
    highRiskNeighborsCount: number;
    suspiciousPathsCount: number;
    muleFindingsCount: number;
    baseEntityScore: number;
  }): { score: number; level: RiskLevel; factors: NetworkRiskFactors } {
    // 1. Cycle Factor (0 - 30 pts)
    const cycleFactor = params.hasCycles ? Math.min(30, 20 + params.cycleCount * 5) : 0;

    // 2. High-Risk Neighbor Factor (0 - 25 pts)
    const highRiskNeighborFactor = Math.min(25, params.highRiskNeighborsCount * 7);

    // 3. Suspicious Path Factor (0 - 20 pts)
    const suspiciousPathFactor = Math.min(20, params.suspiciousPathsCount * 10);

    // 4. Velocity & Mule Factor (0 - 15 pts)
    const velocityFactor = params.muleFindingsCount > 0 ? 15 : 0;

    // 5. Cluster & Base Factor (0 - 10 pts)
    const clusterFactor = Math.round((params.baseEntityScore / 100) * 10);

    const totalScore = Math.min(99, Math.max(10, cycleFactor + highRiskNeighborFactor + suspiciousPathFactor + velocityFactor + clusterFactor));

    const level: RiskLevel =
      totalScore >= 80 ? 'CRITICAL' : totalScore >= 60 ? 'HIGH' : totalScore >= 30 ? 'MEDIUM' : 'LOW';

    return {
      score: totalScore,
      level,
      factors: {
        cycleFactor,
        highRiskNeighborFactor,
        suspiciousPathFactor,
        velocityFactor,
        clusterFactor,
      },
    };
  }
}

export const networkRiskScorer = new NetworkRiskScorer();
