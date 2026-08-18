import { RiskLevel, EntityType, TransactionChannel, TransactionStatus } from '@prisma/client';

export type RiskSubjectType = 'TRANSACTION' | 'ACCOUNT' | 'ENTITY' | 'NETWORK';

export type RiskFactorCategory =
  | 'AMOUNT'
  | 'VELOCITY'
  | 'BEHAVIOR'
  | 'NETWORK'
  | 'COUNTERPARTY'
  | 'PATTERN'
  | 'ENTITY'
  | 'HISTORY';

export interface RiskEvidence {
  statement: string;
  metricName: string;
  metricValue: string | number;
  timeWindow?: string;
  threshold?: string | number;
  relatedTransactionIds?: string[];
  relatedAccountIds?: string[];
  relatedEntityIds?: string[];
}

export interface RiskFactor {
  id: string;
  name: string;
  category: RiskFactorCategory;
  contribution: number; // actual score points added (e.g. 18)
  weight: number; // maximum points this factor can contribute (e.g. 20)
  severity: RiskLevel;
  explanation: string;
  evidence: RiskEvidence[];
  relatedRecords: {
    transactionIds?: string[];
    accountIds?: string[];
    entityIds?: string[];
  };
}

export interface RiskAssessment {
  id: string;
  subjectId: string;
  subjectType: RiskSubjectType;
  subjectLabel: string;
  subjectSublabel?: string;
  overallScore: number; // 0 - 100
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  topFactors: RiskFactor[];
  summaryReasons: string[];
  evidenceList: RiskEvidence[];
  engineVersion: string; // e.g. "risk-engine-v1"
  calculatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface RiskOverviewStats {
  totalEntitiesAssessed: number;
  criticalEntitiesCount: number;
  highRiskEntitiesCount: number;
  mediumRiskEntitiesCount: number;
  lowRiskEntitiesCount: number;
  criticalTransactionsCount: number;
  highRiskTransactionsCount: number;
  topRiskFactorsDistribution: Array<{
    category: RiskFactorCategory;
    name: string;
    triggerCount: number;
    averageContribution: number;
  }>;
  recentAssessments: Array<{
    id: string;
    subjectId: string;
    subjectType: RiskSubjectType;
    subjectLabel: string;
    score: number;
    riskLevel: RiskLevel;
    topFactor: string;
    calculatedAt: string;
  }>;
}
