import { RiskLevel, AIClassification, AIAssessmentTargetType } from '@prisma/client';

export { AIClassification, AIAssessmentTargetType };

export interface ExtractedFeatures {
  // Transaction Amount Features
  amount: number;
  amountToMeanRatio: number;
  amountToMedianRatio: number;
  amountZScore: number;
  isRoundAmount: boolean;
  isSubThresholdStructuring: boolean; // Just below ₹50,000 reporting threshold

  // Velocity & Frequency Features
  count5m: number;
  count15m: number;
  count1h: number;
  count24h: number;
  volume24h: number;
  frequencyBurstZScore: number;

  // Behavioral & Timing Features
  isOddHourTransfer: boolean; // 11 PM to 5 AM
  dormancyDays: number;
  isDormantAwakening: boolean;
  accountAgeDays: number;
  accountBalanceToAmountRatio: number;

  // Counterparty Features
  uniqueCounterparties24h: number;
  highRiskCounterpartiesCount: number;
  newCounterpartyRatio: number;
  counterpartyConcentrationHHI: number; // Herfindahl-Hirschman Index

  // Phase 3 Graph & Network Features
  cycleParticipationCount: number;
  muleChainLength: number;
  highRiskNeighborRatio: number;
  shortestPathToKnownBadActor: number; // -1 if infinite
  networkClusteringCoeff: number;
  compositeNetworkRisk: number; // 0 - 100 from Phase 3

  // Historical & Prior Risk
  priorSuspiciousAlertsCount: number;
  deterministicRiskScore: number; // 0 - 100 from Phase 4
  isPEPOrSanctioned: boolean;
}

export interface BehavioralBaseline {
  targetId: string;
  targetType: AIAssessmentTargetType;
  historyCount: number;
  meanAmount: number;
  medianAmount: number;
  stdDevAmount: number;
  maxAmount: number;
  p95Amount: number;
  meanDailyFrequency: number;
  typicalCounterpartyIds: string[];
  activeHoursDistribution: Record<number, number>; // Hour (0-23) -> percentage
  dormancyDays: number;
  calculatedAt: string;
}

export interface AnomalyDeviationItem {
  feature: string;
  observedValue: number | string;
  expectedBaseline: number | string;
  deviationRatio: number; // e.g. 4.8x
  zScore: number;
  isAnomaly: boolean;
  severity: RiskLevel;
  explanation: string;
}

export interface AnomalyDetectionResult {
  anomalyScore: number; // 0 - 100
  isAnomalous: boolean;
  severity: RiskLevel;
  deviations: AnomalyDeviationItem[];
  topAnomalyDrivers: string[];
  baselineSnapshot: BehavioralBaseline;
}

export interface AIPredictionResult {
  fraudProbability: number; // 0.00 - 1.00
  fraudScore: number; // 0.0 - 100.0
  classification: AIClassification;
  confidence: number; // 0.00 - 1.00
  keyPredictiveDrivers: Array<{
    feature: string;
    impactPercentage: number;
    description: string;
  }>;
  modelMetadata: {
    modelName: string;
    modelVersion: string;
    inferenceLatencyMs: number;
    ensembleComponents: string[];
  };
}

export interface SuspiciousPattern {
  id: string;
  patternType:
    | 'CAROUSEL_ROUND_TRIP'
    | 'RAPID_SMURFING_DISPERSAL'
    | 'MULE_FAN_IN_AGGREGATION'
    | 'DORMANT_HIGH_VALUE_SPIKE'
    | 'HIGH_RISK_MERCHANT_DIVERT'
    | 'PEELING_CHAIN_LAYERING';
  confidence: number; // 0.0 - 1.0
  title: string;
  description: string;
  entitiesInvolved: string[];
  accountsInvolved: string[];
  transactionsInvolved: string[];
  totalVolume: number;
  evidence: string[];
}

export interface RiskFusionResult {
  fusedScore: number; // 0 - 100
  fusedLevel: RiskLevel;
  deterministicScore: number; // Phase 4 baseline (35% weight)
  networkScore: number; // Phase 3 graph score (25% weight)
  aiFraudProbabilityScore: number; // Phase 5 AI score (25% weight)
  anomalyScore: number; // Phase 5 Anomaly score (15% weight)
  fusionWeights: {
    deterministic: number;
    network: number;
    aiPredictive: number;
    anomaly: number;
  };
  reconciliationNotes: string[];
}

export interface XAIEvidenceItem {
  id: string;
  statement: string;
  metricName: string;
  metricValue: string | number;
  baselineValue?: string | number;
  deviationRatio?: number;
  impactPercentage: number;
  category: 'AMOUNT_ANOMALY' | 'VELOCITY_BURST' | 'NETWORK_TOPOLOGY' | 'BEHAVIORAL_DEVIATION' | 'COUNTERPARTY_RISK' | 'HISTORICAL_PATTERN';
  severity: RiskLevel;
}

export interface FullAIAssessment {
  id: string;
  targetType: AIAssessmentTargetType;
  targetId: string;
  targetLabel: string;
  targetSublabel?: string;
  fraudProbability: number;
  fraudScore: number;
  anomalyScore: number;
  classification: AIClassification;
  confidence: number;
  deterministicRiskScore: number;
  networkRiskScore: number;
  combinedScore: number;
  combinedRiskLevel: RiskLevel;
  evidence: XAIEvidenceItem[];
  featureSnapshot: ExtractedFeatures;
  anomalyResult: AnomalyDetectionResult;
  predictionResult: AIPredictionResult;
  fusionResult: RiskFusionResult;
  suspiciousPatterns: SuspiciousPattern[];
  suggestedAction: string;
  modelMetadata: {
    modelName: string;
    modelVersion: string;
  };
  createdAt: string;
}

export interface AIOverviewStats {
  totalAssessments: number;
  highConfidenceFraudCount: number;
  likelyFraudCount: number;
  suspiciousCount: number;
  normalCount: number;
  averageFraudProbability: number;
  averageAnomalyScore: number;
  topDetectedPatterns: Array<{
    patternType: string;
    title: string;
    count: number;
  }>;
  recentAssessments: Array<{
    id: string;
    targetType: AIAssessmentTargetType;
    targetId: string;
    targetLabel: string;
    fraudProbability: number;
    combinedScore: number;
    classification: AIClassification;
    combinedRiskLevel: RiskLevel;
    topEvidence: string;
    createdAt: string;
  }>;
}
