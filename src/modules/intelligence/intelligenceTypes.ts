import { CasePriority, CaseStatus, RiskLevel } from '@prisma/client';

export interface GroundedEvidenceReference {
  id: string;
  type: string;
  title: string;
  source: string;
  sourceId?: string | null;
  referenceUrl?: string;
  snippet: string;
  severity?: RiskLevel | string;
  contribution?: number;
}

export interface KeyDriver {
  factor: string;
  impact: string;
  description: string;
  source: string;
  evidenceRefId?: string;
}

export interface InvestigationContext {
  caseDetails: {
    id: string;
    caseNumber: string;
    title: string;
    description: string;
    priority: CasePriority;
    status: CaseStatus;
    riskScore: number;
    riskLevel: RiskLevel;
    escalationReason?: string | null;
    resolutionType?: string | null;
    resolutionSummary?: string | null;
    createdAt: string;
    updatedAt: string;
    assignedInvestigator?: {
      id: string;
      name: string;
      badgeNumber?: string | null;
    } | null;
  };
  primaryEntity: {
    id: string;
    name: string;
    entityType: string;
    taxId?: string | null;
    registrationNumber?: string | null;
    jurisdiction?: string | null;
    riskScore: number;
    riskLevel: RiskLevel;
    isSanctioned: boolean;
    isPEP: boolean;
    accounts: Array<{
      id: string;
      accountNumber: string;
      accountType: string;
      bankName: string;
      balance: number;
      currency: string;
      status: string;
    }>;
  } | null;
  alerts: Array<{
    id: string;
    alertNumber: string;
    alertType: string;
    title: string;
    description: string;
    severity: RiskLevel;
    status: string;
    indicators: string[];
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    transactionNumber: string;
    amount: number;
    currency: string;
    channel: string;
    status: string;
    riskScore: number;
    riskLevel: RiskLevel;
    timestamp: string;
    senderAccountNumber?: string;
    senderEntityName?: string;
    receiverAccountNumber?: string;
    receiverEntityName?: string;
    isCircular?: boolean;
    isMuleCandidate?: boolean;
  }>;
  networkFindings: {
    compositeRiskScore: number;
    riskLevel: RiskLevel;
    connectedEntitiesCount: number;
    cycles: Array<{
      cycleId: string;
      length: number;
      entities: string[];
      totalAmount: number;
      description: string;
    }>;
    highRiskNeighbors: Array<{
      entityId: string;
      name: string;
      riskLevel: RiskLevel;
      riskScore: number;
      relationship: string;
    }>;
    muleFindings: Array<{
      accountNumber: string;
      fanIn: number;
      fanOut: number;
      velocityMinutes: number;
      dispersalRatio: number;
    }>;
  } | null;
  deterministicRisk: {
    overallScore: number;
    riskLevel: RiskLevel;
    factors: Array<{
      factorName: string;
      scoreContribution: number;
      explanation: string;
      evidenceCount: number;
    }>;
    engineVersion: string;
    calculatedAt: string;
  } | null;
  aiRiskAssessment: {
    fraudProbability: number;
    anomalyScore: number;
    classification: string;
    fusedRiskScore: number;
    fusedLevel: RiskLevel;
    modelVersion: string;
    topAnomalies: string[];
  } | null;
  evidences: Array<{
    id: string;
    evidenceType: string;
    title: string;
    description: string;
    source: string;
    sourceId?: string | null;
    severity: RiskLevel;
    metadata?: any;
    createdAt: string;
  }>;
  notes: Array<{
    id: string;
    authorName: string;
    content: string;
    isSystemGenerated: boolean;
    createdAt: string;
  }>;
  auditTimeline: Array<{
    id: string;
    action: string;
    actorName: string;
    createdAt: string;
    metadata?: any;
  }>;
}

export interface AssistantResponse {
  question: string;
  answer: string;
  confidence: 'SUPPORTED' | 'INSUFFICIENT_EVIDENCE';
  evidence: GroundedEvidenceReference[];
  keyDrivers: KeyDriver[];
  suggestedNextSteps: string[];
  relatedEntities: string[];
  relatedTransactions: string[];
  relatedFindings: string[];
  generatedAt: string;
}

export interface RiskExplanationPayload {
  caseNumber: string;
  overallScore: number;
  riskLevel: RiskLevel;
  primaryDrivers: KeyDriver[];
  evidenceReferences: GroundedEvidenceReference[];
  deterministicFactors: Array<{
    name: string;
    contribution: number;
    statement: string;
  }>;
  networkRiskComponent: number;
  aiFraudProbability: number;
  generatedExplanation: string;
}

export interface NetworkExplanationPayload {
  caseNumber: string;
  primaryEntity: string;
  detectedCyclesCount: number;
  cycles: Array<{
    id: string;
    participants: string[];
    associatedVolume: number;
    narrative: string;
  }>;
  highRiskNeighborsCount: number;
  muleChainsCount: number;
  networkRiskScore: number;
  evidenceReferences: GroundedEvidenceReference[];
  narrativeExplanation: string;
}

export interface TransactionExplanationPayload {
  transactionId: string;
  amount: number;
  historicalMean: number;
  deviationMultiplier: number;
  velocityObserved: string;
  isStructuringSuspect: boolean;
  channel: string;
  counterpartyRisk: string;
  evidenceReferences: GroundedEvidenceReference[];
  narrativeExplanation: string;
}

export interface AlertExplanationPayload {
  alertNumber: string;
  alertType: string;
  severity: RiskLevel;
  triggeringIndicators: string[];
  relatedEntity: string;
  relatedTransactionCount: number;
  evidenceReferences: GroundedEvidenceReference[];
  narrativeExplanation: string;
}

export interface CaseSummaryPayload {
  caseNumber: string;
  title: string;
  executiveSummary: string;
  primaryEntity: {
    name: string;
    type: string;
    riskScore: number;
    riskLevel: RiskLevel;
  };
  suspiciousActivity: string;
  keyTransactionsCount: number;
  totalTransactionVolume: number;
  networkHighlights: string[];
  topRiskFactors: string[];
  docketedEvidenceCount: number;
  currentStatus: CaseStatus;
  priority: CasePriority;
  outstandingInvestigationQuestions: string[];
  evidenceReferences: GroundedEvidenceReference[];
  generatedAt: string;
}
