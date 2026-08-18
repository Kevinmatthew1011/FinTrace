export interface GraphNode {
  id: string;
  label: string;
  type: 'ENTITY' | 'ACCOUNT' | 'INTERMEDIARY';
  riskScore: number;
  isMuleFlagged?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: number;
  txCount: number;
  timestamp: string;
}

export interface NetworkSubgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  detectedPatterns: string[];
}

export interface IGraphAnalysisService {
  buildEntityGraph(entityId: string, depth?: number): Promise<NetworkSubgraph>;
  detectCycles(nodes: string[]): Promise<string[][]>;
  findMoneyFlowPaths(sourceId: string, targetId: string): Promise<string[][]>;
}

export class GraphAnalysisServiceStub implements IGraphAnalysisService {
  async buildEntityGraph(entityId: string, _depth = 2): Promise<NetworkSubgraph> {
    return {
      nodes: [
        { id: entityId, label: 'Primary Subject', type: 'ENTITY', riskScore: 88, isMuleFlagged: false },
        { id: 'ACC-01', label: 'Layering Account A', type: 'ACCOUNT', riskScore: 79, isMuleFlagged: true },
        { id: 'ACC-02', label: 'Mule Aggregator B', type: 'ACCOUNT', riskScore: 92, isMuleFlagged: true },
      ],
      edges: [
        { id: 'e1', source: entityId, target: 'ACC-01', amount: 500000, txCount: 4, timestamp: new Date().toISOString() },
        { id: 'e2', source: 'ACC-01', target: 'ACC-02', amount: 490000, txCount: 8, timestamp: new Date().toISOString() },
      ],
      detectedPatterns: ['Rapid Dispersal Flow', 'Layering Structuring'],
    };
  }

  async detectCycles(_nodes: string[]): Promise<string[][]> {
    return [];
  }

  async findMoneyFlowPaths(sourceId: string, targetId: string): Promise<string[][]> {
    return [[sourceId, 'ACC-01', 'ACC-02', targetId]];
  }
}

export const graphAnalysisService = new GraphAnalysisServiceStub();
