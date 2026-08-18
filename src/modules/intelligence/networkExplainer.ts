import {
  GroundedEvidenceReference,
  InvestigationContext,
  NetworkExplanationPayload,
} from './intelligenceTypes';

export class NetworkExplainer {
  /**
   * Explain money flow patterns and network topologies
   */
  explainCaseNetwork(context: InvestigationContext): NetworkExplanationPayload {
    const caseNumber = context.caseDetails.caseNumber;
    const primaryEntity = context.primaryEntity?.name || 'Subject Entity';
    const net = context.networkFindings;

    const evidenceReferences: GroundedEvidenceReference[] = [];
    const cyclesList: Array<{
      id: string;
      participants: string[];
      associatedVolume: number;
      narrative: string;
    }> = [];

    if (!net || (net.cycles.length === 0 && net.highRiskNeighbors.length === 0 && net.muleFindings.length === 0)) {
      return {
        caseNumber,
        primaryEntity,
        detectedCyclesCount: 0,
        cycles: [],
        highRiskNeighborsCount: 0,
        muleChainsCount: 0,
        networkRiskScore: 0,
        evidenceReferences: [],
        narrativeExplanation: `No suspicious circular fund loops, mule aggregation topologies, or high-risk network adjacencies were detected for ${primaryEntity}.`,
      };
    }

    // 1. Process Detected Cycles
    net.cycles.forEach((c, idx) => {
      const volStr = `₹${(c.totalAmount / 100000).toFixed(1)}L`;
      const narrative = `Circular fund loop of length ${c.length} involving ${c.entities.length} entities with total flow volume of ${volStr}.`;

      cyclesList.push({
        id: c.cycleId || `CYC-${idx + 1}`,
        participants: c.entities,
        associatedVolume: c.totalAmount,
        narrative,
      });

      evidenceReferences.push({
        id: `EV-CYCLE-${idx + 1}`,
        type: 'CIRCULAR_LOOP',
        title: `Circular Flow Loop #${idx + 1}`,
        source: 'PHASE3_GRAPH_INTELLIGENCE_ENGINE',
        snippet: `${narrative} Entities: ${c.entities.join(' ➔ ')}`,
        severity: 'CRITICAL',
      });
    });

    // 2. Process High-Risk Neighbors
    net.highRiskNeighbors.forEach((n, idx) => {
      evidenceReferences.push({
        id: `EV-NEIGHBOR-${idx + 1}`,
        type: 'COUNTERPARTY_EXPOSURE',
        title: `Adjacent Node: ${n.name}`,
        source: 'PHASE3_GRAPH_INTELLIGENCE_ENGINE',
        sourceId: n.entityId,
        snippet: `Entity ${n.name} has risk level ${n.riskLevel} (${n.riskScore}/100) via relationship ${n.relationship}`,
        severity: n.riskLevel,
      });
    });

    // 3. Process Mule Findings
    net.muleFindings.forEach((m, idx) => {
      evidenceReferences.push({
        id: `EV-MULE-${idx + 1}`,
        type: 'MULE_CHAIN',
        title: `Mule Hub: Account ${m.accountNumber}`,
        source: 'PHASE3_GRAPH_INTELLIGENCE_ENGINE',
        sourceId: m.accountNumber,
        snippet: `Rapid dispersal detected: ${m.fanIn} in-transfers followed by ${m.fanOut} out-transfers within ${m.velocityMinutes} mins (ratio: ${(m.dispersalRatio * 100).toFixed(0)}%).`,
        severity: 'HIGH',
      });
    });

    // 4. Construct narrative
    let narrative = `Graph intelligence analysis for ${primaryEntity} reveals a Network Composite Risk Score of ${net.compositeRiskScore.toFixed(1)}/100 (${net.riskLevel}).\n\n`;

    if (cyclesList.length > 0) {
      narrative += `**Circular Fund Routing:**\n`;
      narrative += `Detected ${cyclesList.length} circular flow cycle(s) indicating potential round-tripping or VAT carousel layering.\n`;
      cyclesList.forEach((c) => {
        narrative += `- ${c.narrative} (${c.participants.join(' ➔ ')})\n`;
      });
      narrative += `\n`;
    }

    if (net.highRiskNeighbors.length > 0) {
      narrative += `**High-Risk Counterparty Adjacency:**\n`;
      narrative += `${primaryEntity} maintains direct transactional edges with ${net.highRiskNeighbors.length} high-risk entities: ${net.highRiskNeighbors.map((n) => `${n.name} [${n.riskLevel}]`).join(', ')}.\n\n`;
    }

    if (net.muleFindings.length > 0) {
      narrative += `**Mule Dispersal Topologies:**\n`;
      narrative += `Identified ${net.muleFindings.length} account(s) exhibiting rapid fund funneling and high-velocity dispersal.\n`;
    }

    return {
      caseNumber,
      primaryEntity,
      detectedCyclesCount: cyclesList.length,
      cycles: cyclesList,
      highRiskNeighborsCount: net.highRiskNeighbors.length,
      muleChainsCount: net.muleFindings.length,
      networkRiskScore: net.compositeRiskScore,
      evidenceReferences,
      narrativeExplanation: narrative,
    };
  }
}

export const networkExplainer = new NetworkExplainer();
