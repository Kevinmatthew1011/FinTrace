import {
  CaseSummaryPayload,
  GroundedEvidenceReference,
  InvestigationContext,
} from './intelligenceTypes';

export class CaseSummarizer {
  /**
   * Generate an executive dossier summary grounded in case evidence
   */
  generateCaseSummary(context: InvestigationContext): CaseSummaryPayload {
    const caseDetails = context.caseDetails;
    const entity = context.primaryEntity;
    const net = context.networkFindings;
    const detRisk = context.deterministicRisk;
    const aiRisk = context.aiRiskAssessment;
    const txns = context.transactions;
    const alerts = context.alerts;
    const evidences = context.evidences;

    const totalTxVolume = txns.reduce((acc, t) => acc + t.amount, 0);
    const evidenceReferences: GroundedEvidenceReference[] = [];

    // 1. Gather highlights
    const networkHighlights: string[] = [];
    if (net) {
      if (net.cycles.length > 0) {
        networkHighlights.push(`${net.cycles.length} circular fund movement cycle(s) identified`);
      }
      if (net.highRiskNeighbors.length > 0) {
        networkHighlights.push(`Direct ties to ${net.highRiskNeighbors.length} high-risk or sanctioned entities`);
      }
      if (net.muleFindings.length > 0) {
        networkHighlights.push(`${net.muleFindings.length} suspected mule account fan-out patterns`);
      }
    }

    const topRiskFactors: string[] = [];
    if (detRisk) {
      detRisk.factors
        .filter((f) => f.scoreContribution > 0)
        .slice(0, 4)
        .forEach((f) => {
          topRiskFactors.push(`${f.factorName.replace(/_/g, ' ')} (+${f.scoreContribution} pts)`);
        });
    }

    // 2. Identify outstanding investigation questions
    const outstandingQuestions: string[] = [];
    if (!entity?.taxId) {
      outstandingQuestions.push('Verify missing Tax Identification Number (PAN/GSTIN) with Corporate Affairs registry.');
    }
    if (entity?.isPEP) {
      outstandingQuestions.push('Conduct enhanced due diligence on Politically Exposed Person (PEP) beneficial ownership.');
    }
    if (net && net.cycles.length > 0) {
      outstandingQuestions.push('Subpoena intermediary nodal accounts involved in circular fund loops for invoice reconciliation.');
    }
    if (aiRisk && aiRisk.fraudProbability >= 0.8) {
      outstandingQuestions.push('Request immediate branch freeze on outbound IMPS/RTGS transfers pending senior review.');
    }
    if (evidences.length < 3) {
      outstandingQuestions.push('Docket subpoenaed bank account statements and counterparty contracts into the case evidence catalog.');
    }

    // 3. Grounded evidence references
    evidences.slice(0, 5).forEach((e) => {
      evidenceReferences.push({
        id: e.id,
        type: e.evidenceType,
        title: e.title,
        source: e.source,
        sourceId: e.sourceId,
        snippet: e.description,
        severity: e.severity,
      });
    });

    // 4. Synthesize executive summary
    const entityName = entity?.name || 'Subject Entity';
    const entityType = entity?.entityType || 'CORPORATION';
    const riskScore = caseDetails.riskScore || entity?.riskScore || 0;
    const riskLevel = caseDetails.riskLevel || entity?.riskLevel || 'LOW';

    let summaryText = `Executive Summary for **${caseDetails.caseNumber}** (${caseDetails.title}).\n\n`;
    summaryText += `• **Subject Profile:** ${entityName} (${entityType}) holds an evaluated risk score of **${riskScore.toFixed(1)}/100** [${riskLevel}]. `;
    if (entity?.isSanctioned) summaryText += `Entity is flagged on global Sanctions watchlist. `;
    if (entity?.isPEP) summaryText += `Entity is associated with Politically Exposed Persons (PEP). `;
    summaryText += `\n`;

    summaryText += `• **Transaction Intelligence:** ${txns.length} linked transactions analyzed, representing a total flow volume of **₹${(totalTxVolume / 100000).toFixed(2)} Lakhs** across ${entity?.accounts.length || 1} account(s).\n`;

    if (networkHighlights.length > 0) {
      summaryText += `• **Graph Topologies:** ${networkHighlights.join('; ')}.\n`;
    }

    if (topRiskFactors.length > 0) {
      summaryText += `• **Primary Risk Contributors:** ${topRiskFactors.join(', ')}.\n`;
    }

    summaryText += `• **Current Case State:** Status is **${caseDetails.status}** with **${caseDetails.priority}** priority. ${evidences.length} evidence item(s) and ${alerts.length} fraud alert(s) docketed.`;

    return {
      caseNumber: caseDetails.caseNumber,
      title: caseDetails.title,
      executiveSummary: summaryText,
      primaryEntity: {
        name: entityName,
        type: entityType,
        riskScore,
        riskLevel,
      },
      suspiciousActivity: topRiskFactors.join('; ') || 'Behavioral volume and network anomaly',
      keyTransactionsCount: txns.length,
      totalTransactionVolume: totalTxVolume,
      networkHighlights,
      topRiskFactors,
      docketedEvidenceCount: evidences.length,
      currentStatus: caseDetails.status,
      priority: caseDetails.priority,
      outstandingInvestigationQuestions: outstandingQuestions,
      evidenceReferences,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const caseSummarizer = new CaseSummarizer();
