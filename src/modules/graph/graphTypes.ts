import { RiskLevel, EntityType, TransactionChannel, TransactionStatus } from '@prisma/client';

export type NodeType = 'ENTITY' | 'ACCOUNT' | 'TRANSACTION';

export type EdgeType = 'OWNS_ACCOUNT' | 'SENT' | 'RECEIVED' | 'TRANSFERRED_TO';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  sublabel?: string;
  entityId?: string;
  accountId?: string;
  transactionId?: string;
  entityType?: EntityType;
  bankName?: string;
  accountNumber?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  isFlagged?: boolean;
  isMule?: boolean;
  isFrozen?: boolean;
  totalVolumeRupees?: number;
  transactionCount?: number;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  transactionId?: string;
  referenceNumber?: string;
  amount?: number;
  currency?: string;
  channel?: TransactionChannel;
  timestamp?: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
  status?: TransactionStatus;
  isSuspicious?: boolean;
}

export interface FinancialGraph {
  rootId?: string;
  rootType?: NodeType;
  depth: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  statistics: GraphStatistics;
}

export interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  entityCount: number;
  accountCount: number;
  transactionCount: number;
  suspiciousNodeCount: number;
  suspiciousEdgeCount: number;
  totalVolumeRupees: number;
  maxHopDistance: number;
}

export interface GraphPath {
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  hops: number;
  nodePath: string[];
  edgePath: string[];
  transactions: Array<{
    id: string;
    referenceNumber: string;
    senderEntity: string;
    receiverEntity: string;
    amount: number;
    channel: string;
    timestamp: string;
    riskScore: number;
    riskLevel: RiskLevel;
  }>;
  totalValueRupees: number;
  timeSpanHours: number;
  highestRiskScore: number;
  highestRiskLevel: RiskLevel;
  evidence: string[];
}

export interface GraphCycle {
  id: string;
  entities: Array<{ id: string; name: string; riskScore: number; riskLevel: RiskLevel }>;
  accounts: Array<{ id: string; accountNumber: string; bankName: string }>;
  transactions: Array<{
    id: string;
    referenceNumber: string;
    amount: number;
    senderAccount: string;
    receiverAccount: string;
    timestamp: string;
  }>;
  hopCount: number;
  totalTransactionValue: number;
  startTimestamp: string;
  endTimestamp: string;
  durationMinutes: number;
  riskScore: number;
  riskLevel: RiskLevel;
  evidence: string;
}

export interface GraphCluster {
  id: string;
  name: string;
  memberNodeIds: string[];
  entityCount: number;
  accountCount: number;
  edgeCount: number;
  suspiciousTxCount: number;
  totalVolumeRupees: number;
  highestRiskScore: number;
  dominantRiskLevel: RiskLevel;
  typologyHint: string;
}

export type FindingType =
  | 'CIRCULAR_FLOW'
  | 'MULE_CHAIN'
  | 'HIGH_RISK_CONNECTION'
  | 'SUSPICIOUS_CLUSTER'
  | 'HIGH_VELOCITY'
  | 'CONCENTRATION'
  | 'STRUCTURING_FLOW';

export interface GraphFinding {
  id: string;
  type: FindingType;
  severity: RiskLevel;
  title: string;
  description: string;
  evidence: string[];
  relatedNodeIds: string[];
  relatedTransactionIds: string[];
  riskScore: number;
  riskLevel: RiskLevel;
  recommendedFocus: string;
}

export interface HighRiskConnection {
  entityId: string;
  entityName: string;
  entityType: string;
  riskScore: number;
  riskLevel: RiskLevel;
  relationshipType: 'DIRECT' | 'INDIRECT_HOP_2' | 'INDIRECT_HOP_3';
  hopDistance: number;
  transactionCount: number;
  totalAmountRupees: number;
  lastActive: string;
}

export interface GraphAnalysisResult {
  entity: {
    id: string;
    name: string;
    type: EntityType;
    taxIdentifier: string;
    riskScore: number;
    riskLevel: RiskLevel;
    jurisdiction: string;
  };
  networkRiskScore: number;
  riskLevel: RiskLevel;
  riskFactors: {
    cycleFactor: number;
    highRiskNeighborFactor: number;
    suspiciousPathFactor: number;
    velocityFactor: number;
    clusterFactor: number;
  };
  findings: GraphFinding[];
  suspiciousPaths: GraphPath[];
  cycles: GraphCycle[];
  clusters: GraphCluster[];
  highRiskConnections: HighRiskConnection[];
  statistics: GraphStatistics;
}
