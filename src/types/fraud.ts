export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export type TransactionStatus = 'COMPLETED' | 'FLAGGED' | 'BLOCKED' | 'UNDER_REVIEW';

export type TransactionChannel = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS' | 'SWIFT' | 'CRYPTO';

export interface Transaction {
  id: string;
  referenceNumber: string;
  timestamp: string;
  senderAccount: string;
  senderEntityName: string;
  senderEntityId: string;
  receiverAccount: string;
  receiverEntityName: string;
  receiverEntityId: string;
  amount: number;
  currency: string;
  channel: TransactionChannel;
  riskScore: number;
  riskLevel: RiskLevel;
  status: TransactionStatus;
  flags: string[];
  narrative?: string;
}

export type EntityType = 'INDIVIDUAL' | 'BUSINESS' | 'SHELL_COMPANY' | 'MULE_AGGREGATOR' | 'HIGH_RISK_MERCHANT';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  registrationNumber?: string;
  taxIdentifier: string;
  riskScore: number;
  riskLevel: RiskLevel;
  transactionCount: number;
  totalVolumeRupees: number;
  alertCount: number;
  status: 'ACTIVE' | 'FLAGGED' | 'FROZEN' | 'UNDER_INVESTIGATION';
  accountsCount: number;
  primaryJurisdiction: string;
  flags: string[];
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface Alert {
  id: string;
  alertNumber: string;
  title: string;
  description: string;
  typology: 'CIRCULAR_ROUTING' | 'RAPID_VELOCITY' | 'MULE_NETWORK' | 'STRUCTURING' | 'DORMANT_SPIKE' | 'HIGH_RISK_INTERACTION';
  severity: AlertSeverity;
  status: AlertStatus;
  entityId: string;
  entityName: string;
  accountId: string;
  amountRupees: number;
  timestamp: string;
  indicators: string[];
}

export type InvestigationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type InvestigationStatus = 'OPEN' | 'UNDER_REVIEW' | 'EVIDENCE_SUBMITTED' | 'CLOSED_CONFIRMED' | 'CLOSED_DISMISSED';

export interface Investigation {
  id: string;
  caseNumber: string;
  title: string;
  typology: string;
  priority: InvestigationPriority;
  riskScore: number;
  riskLevel: RiskLevel;
  assignedInvestigator: string;
  lastUpdated: string;
  status: InvestigationStatus;
  entityCount: number;
  flaggedAmountRupees: number;
  description: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'ENTITY' | 'ACCOUNT' | 'TRANSACTION';
  riskScore: number;
  riskLevel: RiskLevel;
  isFlagged?: boolean;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  amountRupees?: number;
  type: 'TRANSFERS_TO' | 'OWNS_ACCOUNT' | 'LINKED_TO';
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface ActivityTimePoint {
  timeLabel: string;
  timestamp: string;
  totalVolume: number;
  suspiciousVolume: number;
  totalAmountRupees: number;
}

export interface RiskDistributionTier {
  level: RiskLevel;
  label: string;
  count: number;
  percentage: number;
  volumeRupees: number;
}

export interface RegionalActivity {
  region: string;
  transactionCount: number;
  volumeRupees: number;
  percentage: number;
  riskLevel: RiskLevel;
}

export interface DashboardKPISummary {
  totalTransactions: {
    count: number;
    formatted: string;
    changePercentage: number;
    periodComparison: string;
  };
  suspiciousTransactions: {
    count: number;
    formatted: string;
    changePercentage: number;
    periodComparison: string;
    percentageOfTotal: number;
  };
  activeAlerts: {
    count: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    changePercentage: number;
  };
  highRiskEntities: {
    count: number;
    formatted: string;
    changePercentage: number;
    periodComparison: string;
  };
  investigationsSummary: {
    openCount: number;
    underReviewCount: number;
    criticalCount: number;
    recentlyClosedCount: number;
  };
}
