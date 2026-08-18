import { graphBuilder } from './graphBuilder';
import { cycleDetector } from './cycleDetection';
import { pathAnalyzer } from './pathAnalysis';
import { muleChainDetector } from './muleChainDetection';
import { highRiskNeighborAnalyzer } from './highRiskNeighbors';
import { clusterAnalyzer } from './clusterAnalysis';
import { networkRiskScorer } from './networkRisk';
import { graphRepository } from './graphRepository';
import { FinancialGraph, GraphAnalysisResult, GraphFinding } from './graphTypes';

export class GraphIntelligenceService {
  async getNetworkGraph(entityId: string, depth = 2): Promise<FinancialGraph> {
    return graphBuilder.buildEntityGraph(entityId, depth);
  }

  async analyzeEntityNetwork(entityId: string): Promise<GraphAnalysisResult> {
    const entity = await graphRepository.getEntityWithAccounts(entityId);
    if (!entity) {
      throw new Error(`Entity not found: ${entityId}`);
    }

    // Run parallel graph analyses
    const [
      subgraph,
      cycles,
      muleFindings,
      neighborAnalysis,
      allClusters,
    ] = await Promise.all([
      graphBuilder.buildEntityGraph(entityId, 2),
      cycleDetector.detectCycles(entityId),
      muleChainDetector.detectMuleChains(entityId),
      highRiskNeighborAnalyzer.analyzeHighRiskNeighbors(entityId),
      clusterAnalyzer.detectClusters(),
    ]);

    // Filter clusters containing this entity
    const relevantClusters = allClusters.filter((c) => c.memberNodeIds.includes(entityId));

    // Consolidate findings
    const allFindings: GraphFinding[] = [
      ...muleFindings,
      ...neighborAnalysis.findings,
    ];

    // Add cycle findings
    for (const c of cycles) {
      allFindings.push({
        id: `finding-${c.id}`,
        type: 'CIRCULAR_FLOW',
        severity: c.riskLevel,
        title: `Circular Carousel Fund Loop (${c.hopCount} Hops)`,
        description: c.evidence,
        evidence: [
          `Loop involves ${c.entities.length} entities: ${c.entities.map((e) => e.name).join(' ➔ ')}`,
          `Total circular flow: ₹${(c.totalTransactionValue / 100000).toFixed(2)} Lakhs`,
          `Completed within ${c.durationMinutes} minutes`,
        ],
        relatedNodeIds: c.entities.map((e) => e.id),
        relatedTransactionIds: c.transactions.map((t) => t.id),
        riskScore: c.riskScore,
        riskLevel: c.riskLevel,
        recommendedFocus: 'Investigate potential carousel GST structuring and round-tripping invoices.',
      });
    }

    // Calculate Composite Network Risk
    const riskAssessment = networkRiskScorer.calculateNetworkRisk({
      hasCycles: cycles.length > 0,
      cycleCount: cycles.length,
      highRiskNeighborsCount: neighborAnalysis.connections.length,
      suspiciousPathsCount: cycles.length > 0 ? 2 : 0,
      muleFindingsCount: muleFindings.length,
      baseEntityScore: entity.riskScore,
    });

    return {
      entity: {
        id: entity.id,
        name: entity.name,
        type: entity.entityType,
        taxIdentifier: entity.taxIdentifier || 'UNSPECIFIED',
        riskScore: entity.riskScore,
        riskLevel: entity.riskLevel,
        jurisdiction: entity.jurisdiction,
      },
      networkRiskScore: riskAssessment.score,
      riskLevel: riskAssessment.level,
      riskFactors: riskAssessment.factors,
      findings: allFindings,
      suspiciousPaths: [],
      cycles,
      clusters: relevantClusters,
      highRiskConnections: neighborAnalysis.connections,
      statistics: subgraph.statistics,
    };
  }

  async findPath(sourceEntityId: string, targetEntityId: string) {
    return pathAnalyzer.findPath(sourceEntityId, targetEntityId);
  }

  async detectCycles(entityId?: string) {
    return cycleDetector.detectCycles(entityId);
  }

  async detectClusters() {
    return clusterAnalyzer.detectClusters();
  }
}

export const graphIntelligenceService = new GraphIntelligenceService();
