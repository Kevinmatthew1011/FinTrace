import { RiskFusionResult } from './aiTypes';
import { RiskLevel } from '@prisma/client';

export interface FusionWeights {
  deterministic: number;
  network: number;
  aiPredictive: number;
  anomaly: number;
}

export const DEFAULT_FUSION_WEIGHTS: FusionWeights = {
  deterministic: 0.35, // Phase 4 Deterministic Risk Engine
  network: 0.25,       // Phase 3 Graph Intelligence Engine
  aiPredictive: 0.25,  // Phase 5 AI Fraud Probability
  anomaly: 0.15,       // Phase 5 Behavioral Anomaly Engine
};

export class RiskFusionEngine {
  /**
   * Combine deterministic risk, network intelligence, AI prediction, and anomaly scores
   */
  fuseRisk(
    deterministicScore: number,
    networkScore: number,
    aiFraudProbabilityScore: number,
    anomalyScore: number,
    customWeights: Partial<FusionWeights> = {}
  ): RiskFusionResult {
    const weights: FusionWeights = {
      ...DEFAULT_FUSION_WEIGHTS,
      ...customWeights,
    };

    // Calculate weighted sum
    const weightedDeterministic = deterministicScore * weights.deterministic;
    const weightedNetwork = networkScore * weights.network;
    const weightedAI = aiFraudProbabilityScore * weights.aiPredictive;
    const weightedAnomaly = anomalyScore * weights.anomaly;

    const rawFused = weightedDeterministic + weightedNetwork + weightedAI + weightedAnomaly;
    const fusedScore = Number(Math.max(0, Math.min(100, rawFused)).toFixed(1));

    // Determine fused risk level
    let fusedLevel: RiskLevel = 'LOW';
    if (fusedScore >= 80) {
      fusedLevel = 'CRITICAL';
    } else if (fusedScore >= 60) {
      fusedLevel = 'HIGH';
    } else if (fusedScore >= 30) {
      fusedLevel = 'MEDIUM';
    } else {
      fusedLevel = 'LOW';
    }

    // Generate reconciliation notes
    const reconciliationNotes: string[] = [];

    if (Math.abs(aiFraudProbabilityScore - deterministicScore) >= 30) {
      if (aiFraudProbabilityScore > deterministicScore) {
        reconciliationNotes.push(
          `AI Predictive model elevated score (+${(aiFraudProbabilityScore - deterministicScore).toFixed(0)} pts) based on subtle non-linear behavioral & graph correlations missed by deterministic rules.`
        );
      } else {
        reconciliationNotes.push(
          `AI model dampened score (-${(deterministicScore - aiFraudProbabilityScore).toFixed(0)} pts) recognizing normal historical counterparty alignment.`
        );
      }
    }

    if (networkScore >= 70) {
      reconciliationNotes.push(
        `Phase 3 Network Graph Intelligence significantly compounded risk due to adjacency to confirmed circular carousel cycles.`
      );
    }

    if (anomalyScore >= 65) {
      reconciliationNotes.push(
        `Statistical Anomaly Engine flagged extreme multi-sigma deviation from target baseline.`
      );
    }

    if (reconciliationNotes.length === 0) {
      reconciliationNotes.push(
        'Deterministic risk rules, network topology, and AI predictive model signals are in close convergence.'
      );
    }

    return {
      fusedScore,
      fusedLevel,
      deterministicScore,
      networkScore,
      aiFraudProbabilityScore,
      anomalyScore,
      fusionWeights: weights,
      reconciliationNotes,
    };
  }
}

export const riskFusionEngine = new RiskFusionEngine();
