import {
  GroundedEvidenceReference,
  InvestigationContext,
  KeyDriver,
  RiskExplanationPayload,
} from './intelligenceTypes';

export class RiskExplainer {
  /**
   * Produce evidence-grounded risk explanation
   */
  explainCaseRisk(context: InvestigationContext): RiskExplanationPayload {
    const caseDetails = context.caseDetails;
    const detRisk = context.deterministicRisk;
    const aiRisk = context.aiRiskAssessment;
    const netRisk = context.networkFindings;

    const overallScore = caseDetails.riskScore || detRisk?.overallScore || 0;
    const riskLevel = caseDetails.riskLevel || detRisk?.riskLevel || 'LOW';

    const primaryDrivers: KeyDriver[] = [];
    const evidenceReferences: GroundedEvidenceReference[] = [];
    const factorList: Array<{ name: string; contribution: number; statement: string }> = [];

    // 1. Process Deterministic Factors directly from Phase 4 Risk Engine
    if (detRisk && detRisk.factors.length > 0) {
      // Sort factors by contribution descending
      const sorted = [...detRisk.factors].sort((a, b) => b.scoreContribution - a.scoreContribution);

      for (const factor of sorted) {
        if (factor.scoreContribution > 0) {
          primaryDrivers.push({
            factor: factor.factorName.replace(/_/g, ' '),
            impact: `+${factor.scoreContribution} pts`,
            description: factor.explanation,
            source: 'PHASE4_DETERMINISTIC_RISK_ENGINE',
          });

          factorList.push({
            name: factor.factorName,
            contribution: factor.scoreContribution,
            statement: factor.explanation,
          });

          evidenceReferences.push({
            id: `EV-RISK-${factor.factorName}`,
            type: 'RISK_FACTOR',
            title: `Factor: ${factor.factorName.replace(/_/g, ' ')}`,
            source: 'RISK_ENGINE',
            snippet: `${factor.explanation} (+${factor.scoreContribution} risk points)`,
            severity: factor.scoreContribution >= 20 ? 'CRITICAL' : factor.scoreContribution >= 10 ? 'HIGH' : 'MEDIUM',
            contribution: factor.scoreContribution,
          });
        }
      }
    }

    // 2. Process Network Findings from Phase 3 Graph Engine
    if (netRisk && netRisk.compositeRiskScore > 0) {
      const cycleCount = netRisk.cycles.length;
      const neighborCount = netRisk.highRiskNeighbors.length;

      if (cycleCount > 0) {
        primaryDrivers.push({
          factor: 'Circular Layering Cycles',
          impact: `+${cycleCount * 15} pts`,
          description: `${cycleCount} circular fund movement loops detected involving primary entity`,
          source: 'PHASE3_GRAPH_INTELLIGENCE_ENGINE',
        });

        evidenceReferences.push({
          id: 'EV-NET-CYCLES',
          type: 'NETWORK_TOPOLOGY',
          title: 'Circular Fund Movement Loops',
          source: 'GRAPH_ENGINE',
          snippet: `${cycleCount} circular loops identified spanning ₹${(netRisk.cycles.reduce((acc, c) => acc + c.totalAmount, 0) / 100000).toFixed(1)}L volume.`,
          severity: 'CRITICAL',
        });
      }

      if (neighborCount > 0) {
        primaryDrivers.push({
          factor: 'High-Risk Counterparty Adjacency',
          impact: `+${Math.min(neighborCount * 8, 25)} pts`,
          description: `Direct transaction adjacency to ${neighborCount} high-risk or sanctioned entities`,
          source: 'PHASE3_GRAPH_INTELLIGENCE_ENGINE',
        });

        evidenceReferences.push({
          id: 'EV-NET-NEIGHBORS',
          type: 'NETWORK_NEIGHBOR',
          title: 'High-Risk Counterparty Exposure',
          source: 'GRAPH_ENGINE',
          snippet: `Connected to: ${netRisk.highRiskNeighbors.map((n) => `${n.name} (${n.riskLevel})`).join(', ')}`,
          severity: 'HIGH',
        });
      }
    }

    // 3. Process AI Fraud Probability from Phase 5 AI Predictor
    if (aiRisk && aiRisk.fraudProbability > 0.5) {
      primaryDrivers.push({
        factor: 'Predictive Fraud Anomaly',
        impact: `${(aiRisk.fraudProbability * 100).toFixed(0)}% Probability`,
        description: `AI Predictor detected composite behavioral anomalies (${aiRisk.topAnomalies.join(', ') || 'Multi-hop velocity spike'})`,
        source: 'PHASE5_AI_FRAUD_PREDICTOR',
      });

      evidenceReferences.push({
        id: 'EV-AI-FRAUD-PROB',
        type: 'AI_PREDICTIVE_ASSESSMENT',
        title: 'AI Behavioral Anomaly Detection',
        source: 'AI_ENGINE',
        snippet: `Fraud Probability ${(aiRisk.fraudProbability * 100).toFixed(1)}% | Anomaly Score: ${aiRisk.anomalyScore.toFixed(1)}/100`,
        severity: aiRisk.fraudProbability >= 0.8 ? 'CRITICAL' : 'HIGH',
      });
    }

    // 4. Synthesize human-readable narrative
    let narrative = `Case ${caseDetails.caseNumber} is evaluated with an overall risk score of ${overallScore.toFixed(1)}/100 (${riskLevel}).\n\n`;

    if (primaryDrivers.length > 0) {
      narrative += `The primary risk drivers identified from evidence are:\n`;
      primaryDrivers.slice(0, 5).forEach((driver, idx) => {
        narrative += `${idx + 1}. **${driver.factor}** (${driver.impact}): ${driver.description}\n`;
      });
    } else {
      narrative += `No significant suspicious risk factors have been triggered for this case.`;
    }

    return {
      caseNumber: caseDetails.caseNumber,
      overallScore,
      riskLevel,
      primaryDrivers,
      evidenceReferences,
      deterministicFactors: factorList,
      networkRiskComponent: netRisk?.compositeRiskScore || 0,
      aiFraudProbability: aiRisk?.fraudProbability || 0,
      generatedExplanation: narrative,
    };
  }
}

export const riskExplainer = new RiskExplainer();
