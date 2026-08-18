import { prisma } from '@/lib/prisma';
import { evidenceCollector } from './evidenceCollector';
import { riskExplainer } from './riskExplainer';
import { networkExplainer } from './networkExplainer';
import { caseSummarizer } from './caseSummarizer';
import {
  AssistantResponse,
  GroundedEvidenceReference,
  InvestigationContext,
  KeyDriver,
} from './intelligenceTypes';

export class InvestigationAssistant {
  /**
   * Process and answer investigator query with zero hallucination and strict evidence grounding
   */
  async answerInvestigationQuestion(
    caseId: string,
    question: string,
    customQuery?: string,
    actorUserId?: string
  ): Promise<AssistantResponse> {
    const context = await evidenceCollector.collectInvestigationContext(caseId);
    const normalizedQ = (customQuery || question).trim().toLowerCase();

    let response: AssistantResponse;

    if (
      normalizedQ.includes('why is this case risky') ||
      normalizedQ.includes('why is this risky') ||
      normalizedQ.includes('risk score') ||
      normalizedQ.includes('explain risk')
    ) {
      response = this.handleRiskQuestion(context, question);
    } else if (
      normalizedQ.includes('summarize this case') ||
      normalizedQ.includes('summarize case') ||
      normalizedQ.includes('case summary') ||
      normalizedQ.includes('overview')
    ) {
      response = this.handleSummaryQuestion(context, question);
    } else if (
      normalizedQ.includes('money flow') ||
      normalizedQ.includes('explain network') ||
      normalizedQ.includes('network patterns') ||
      normalizedQ.includes('cycles') ||
      normalizedQ.includes('graph')
    ) {
      response = this.handleNetworkQuestion(context, question);
    } else if (
      normalizedQ.includes('strongest evidence') ||
      normalizedQ.includes('show evidence') ||
      normalizedQ.includes('key evidence')
    ) {
      response = this.handleStrongestEvidenceQuestion(context, question);
    } else if (
      normalizedQ.includes('highest-risk entities') ||
      normalizedQ.includes('high risk entities') ||
      normalizedQ.includes('counterparties')
    ) {
      response = this.handleHighestRiskEntitiesQuestion(context, question);
    } else if (
      normalizedQ.includes('which transactions') ||
      normalizedQ.includes('transactions to review') ||
      normalizedQ.includes('review first')
    ) {
      response = this.handleTransactionsReviewQuestion(context, question);
    } else if (
      normalizedQ.includes('what changed') ||
      normalizedQ.includes('timeline') ||
      normalizedQ.includes('history')
    ) {
      response = this.handleWhatChangedQuestion(context, question);
    } else if (
      normalizedQ.includes('missing') ||
      normalizedQ.includes('evidence missing') ||
      normalizedQ.includes('what evidence is missing')
    ) {
      response = this.handleMissingEvidenceQuestion(context, question);
    } else {
      // General custom query grounded in case context
      response = this.handleCustomQuery(context, question, customQuery || question);
    }

    // Log AI Explanation Request in Audit Trail
    try {
      await prisma.auditLog.create({
        data: {
          caseId,
          userId: actorUserId,
          action: 'AI_EXPLANATION_REQUESTED',
          resource: 'EXPLAINABLE_INTELLIGENCE_ASSISTANT',
          metadata: {
            question,
            explanationType: response.question,
            confidence: response.confidence,
            evidenceCount: response.evidence.length,
            actor: actorUserId || 'Investigator',
          },
        },
      });
    } catch {
      // Audit log error should not prevent returning explanation
    }

    return response;
  }

  private handleRiskQuestion(context: InvestigationContext, question: string): AssistantResponse {
    const riskExplanation = riskExplainer.explainCaseRisk(context);

    return {
      question: question || 'Why is this case risky?',
      answer: riskExplanation.generatedExplanation,
      confidence: 'SUPPORTED',
      evidence: riskExplanation.evidenceReferences,
      keyDrivers: riskExplanation.primaryDrivers,
      suggestedNextSteps: [
        'Review individual factor contributions in the Risk tab',
        'Cross-reference high-scoring factors with attached transaction receipts',
        'Verify counterparty beneficial ownership on corporate registry',
      ],
      relatedEntities: context.networkFindings?.highRiskNeighbors.map((n) => n.name) || [],
      relatedTransactions: context.transactions.slice(0, 3).map((t) => t.transactionNumber),
      relatedFindings: riskExplanation.deterministicFactors.map((f) => f.name),
      generatedAt: new Date().toISOString(),
    };
  }

  private handleSummaryQuestion(context: InvestigationContext, question: string): AssistantResponse {
    const summary = caseSummarizer.generateCaseSummary(context);

    return {
      question: question || 'Summarize this case.',
      answer: summary.executiveSummary,
      confidence: 'SUPPORTED',
      evidence: summary.evidenceReferences,
      keyDrivers: summary.topRiskFactors.map((f) => ({
        factor: f,
        impact: 'Key Factor',
        description: `Identified during multi-factor assessment of ${summary.primaryEntity.name}`,
        source: 'CASE_SUMMARY_ENGINE',
      })),
      suggestedNextSteps: summary.outstandingInvestigationQuestions,
      relatedEntities: [summary.primaryEntity.name],
      relatedTransactions: context.transactions.slice(0, 5).map((t) => t.transactionNumber),
      relatedFindings: summary.networkHighlights,
      generatedAt: summary.generatedAt,
    };
  }

  private handleNetworkQuestion(context: InvestigationContext, question: string): AssistantResponse {
    const netExplanation = networkExplainer.explainCaseNetwork(context);

    return {
      question: question || 'Explain the money flow and network patterns.',
      answer: netExplanation.narrativeExplanation,
      confidence: 'SUPPORTED',
      evidence: netExplanation.evidenceReferences,
      keyDrivers: netExplanation.cycles.map((c) => ({
        factor: `Circular Loop (${c.id})`,
        impact: `₹${(c.associatedVolume / 100000).toFixed(1)}L`,
        description: c.narrative,
        source: 'PHASE3_GRAPH_ENGINE',
      })),
      suggestedNextSteps: [
        'Inspect full interactive graph topology in the Network tab',
        'Trace intermediary nodes in detected circular loops',
        'Issue KYC verification requests to counterparties identified in loop',
      ],
      relatedEntities: context.networkFindings?.highRiskNeighbors.map((n) => n.name) || [],
      relatedTransactions: context.transactions.filter((t) => t.isCircular).map((t) => t.transactionNumber),
      relatedFindings: netExplanation.cycles.map((c) => c.id),
      generatedAt: new Date().toISOString(),
    };
  }

  private handleStrongestEvidenceQuestion(context: InvestigationContext, question: string): AssistantResponse {
    const evidences = context.evidences;
    const sorted = [...evidences].sort((a, b) => {
      const rank = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (rank[b.severity as keyof typeof rank] || 0) - (rank[a.severity as keyof typeof rank] || 0);
    });

    const topEvidences = sorted.slice(0, 5);
    const evidenceRefs: GroundedEvidenceReference[] = topEvidences.map((e) => ({
      id: e.id,
      type: e.evidenceType,
      title: e.title,
      source: e.source,
      sourceId: e.sourceId,
      snippet: e.description,
      severity: e.severity,
    }));

    let answer = `Here are the top ${topEvidences.length} strongest evidence items docketed in this case:\n\n`;
    topEvidences.forEach((e, idx) => {
      answer += `${idx + 1}. **[${e.evidenceType}] ${e.title}** (${e.severity})\n   ${e.description} *(Source: ${e.source})*\n\n`;
    });

    return {
      question: question || 'Show the strongest evidence.',
      answer,
      confidence: topEvidences.length > 0 ? 'SUPPORTED' : 'INSUFFICIENT_EVIDENCE',
      evidence: evidenceRefs,
      keyDrivers: topEvidences.map((e) => ({
        factor: e.title,
        impact: e.severity,
        description: e.description,
        source: e.source,
      })),
      suggestedNextSteps: [
        'Click on evidence items in the Evidence tab for deep inspection',
        'Docket additional banking subpoenas or STR documents',
      ],
      relatedEntities: [context.primaryEntity?.name || 'Subject Entity'],
      relatedTransactions: topEvidences
        .filter((e) => e.evidenceType === 'TRANSACTION' && e.sourceId)
        .map((e) => e.sourceId!),
      relatedFindings: topEvidences.map((e) => e.id),
      generatedAt: new Date().toISOString(),
    };
  }

  private handleHighestRiskEntitiesQuestion(context: InvestigationContext, question: string): AssistantResponse {
    const net = context.networkFindings;
    const neighbors = net?.highRiskNeighbors || [];

    const evidenceRefs: GroundedEvidenceReference[] = neighbors.map((n, idx) => ({
      id: `EV-HIGH-ENTITY-${idx + 1}`,
      type: 'COUNTERPARTY_EXPOSURE',
      title: `${n.name} [${n.riskLevel}]`,
      source: 'PHASE3_GRAPH_ENGINE',
      sourceId: n.entityId,
      snippet: `Risk score: ${n.riskScore}/100 via relationship ${n.relationship}`,
      severity: n.riskLevel,
    }));

    let answer = '';
    if (neighbors.length > 0) {
      answer = `The primary entity is directly connected to **${neighbors.length} high-risk entities** in the transaction network:\n\n`;
      neighbors.forEach((n, idx) => {
        answer += `${idx + 1}. **${n.name}** — Risk: **${n.riskScore}/100** [${n.riskLevel}] via *${n.relationship}*\n`;
      });
    } else {
      answer = `No direct transaction connections to known high-risk or sanctioned entities were identified.`;
    }

    return {
      question: question || 'What are the highest-risk entities connected to this case?',
      answer,
      confidence: 'SUPPORTED',
      evidence: evidenceRefs,
      keyDrivers: neighbors.map((n) => ({
        factor: n.name,
        impact: `${n.riskScore} pts (${n.riskLevel})`,
        description: `Direct transactional edge (${n.relationship})`,
        source: 'GRAPH_ENGINE',
      })),
      suggestedNextSteps: [
        'Open connected entity profiles in the Network view',
        'Verify if connected entities share common directors or shell addresses',
      ],
      relatedEntities: neighbors.map((n) => n.name),
      relatedTransactions: [],
      relatedFindings: neighbors.map((n) => n.entityId),
      generatedAt: new Date().toISOString(),
    };
  }

  private handleTransactionsReviewQuestion(context: InvestigationContext, question: string): AssistantResponse {
    const txns = context.transactions;
    const sorted = [...txns].sort((a, b) => b.riskScore - a.riskScore || b.amount - a.amount);
    const topTxns = sorted.slice(0, 5);

    const evidenceRefs: GroundedEvidenceReference[] = topTxns.map((t) => ({
      id: `EV-TXN-${t.id}`,
      type: 'HIGH_RISK_TRANSACTION',
      title: `Txn ${t.transactionNumber}: ₹${t.amount.toLocaleString('en-IN')}`,
      source: 'TRANSACTION_REGISTRY',
      sourceId: t.id,
      snippet: `Risk ${t.riskScore}/100 [${t.riskLevel}] via ${t.channel} (${t.senderEntityName || 'Sender'} ➔ ${t.receiverEntityName || 'Receiver'})`,
      severity: t.riskLevel,
    }));

    let answer = `Prioritized transaction review queue for investigator inspection (${topTxns.length} records):\n\n`;
    topTxns.forEach((t, idx) => {
      answer += `${idx + 1}. **${t.transactionNumber}** — **₹${t.amount.toLocaleString('en-IN')}** [${t.riskLevel}, ${t.riskScore}/100]\n`;
      answer += `   From: ${t.senderEntityName || 'Account ' + t.senderAccountNumber} ➔ To: ${t.receiverEntityName || 'Account ' + t.receiverAccountNumber} (${t.channel})\n\n`;
    });

    return {
      question: question || 'Which transactions should I review first?',
      answer,
      confidence: 'SUPPORTED',
      evidence: evidenceRefs,
      keyDrivers: topTxns.map((t) => ({
        factor: t.transactionNumber,
        impact: `₹${(t.amount / 100000).toFixed(1)}L`,
        description: `Risk score ${t.riskScore}/100 via ${t.channel}`,
        source: 'TRANSACTION_STORE',
      })),
      suggestedNextSteps: [
        'Examine transaction timestamps for rapid structuring bursts (< 20 mins)',
        'Check recipient account history for immediate cash withdrawals',
      ],
      relatedEntities: [context.primaryEntity?.name || 'Subject Entity'],
      relatedTransactions: topTxns.map((t) => t.transactionNumber),
      relatedFindings: topTxns.map((t) => t.id),
      generatedAt: new Date().toISOString(),
    };
  }

  private handleWhatChangedQuestion(context: InvestigationContext, question: string): AssistantResponse {
    const timeline = context.auditTimeline;
    const notes = context.notes;

    const evidenceRefs: GroundedEvidenceReference[] = timeline.slice(0, 5).map((l) => ({
      id: l.id,
      type: 'AUDIT_EVENT',
      title: l.action.replace(/_/g, ' '),
      source: 'AUDIT_TRAIL',
      snippet: `Logged by ${l.actorName} at ${new Date(l.createdAt).toLocaleDateString('en-IN')}`,
      severity: 'LOW',
    }));

    let answer = `Investigation case evolution and recent events for **${context.caseDetails.caseNumber}**:\n\n`;
    timeline.slice(0, 6).forEach((event, idx) => {
      answer += `${idx + 1}. **${event.action.replace(/_/g, ' ')}** by ${event.actorName} on ${new Date(event.createdAt).toLocaleDateString('en-IN')}\n`;
    });

    if (notes.length > 0) {
      answer += `\n**Recent Investigator Observations:**\n`;
      notes.slice(0, 2).forEach((n) => {
        answer += `• "${n.content}" — *${n.authorName}*\n`;
      });
    }

    return {
      question: question || 'What changed in this case?',
      answer,
      confidence: 'SUPPORTED',
      evidence: evidenceRefs,
      keyDrivers: [],
      suggestedNextSteps: ['Review complete audit trail in Timeline tab'],
      relatedEntities: [context.primaryEntity?.name || 'Subject Entity'],
      relatedTransactions: [],
      relatedFindings: timeline.map((l) => l.action),
      generatedAt: new Date().toISOString(),
    };
  }

  private handleMissingEvidenceQuestion(context: InvestigationContext, question: string): AssistantResponse {
    const entity = context.primaryEntity;
    const evidences = context.evidences;
    const txns = context.transactions;

    const missingItems: string[] = [];

    if (!entity?.taxId) {
      missingItems.push('Verified PAN / GSTIN registration document');
    }
    if (!entity?.registrationNumber) {
      missingItems.push('Corporate Registrar Certificate of Incorporation');
    }
    if (!evidences.some((e) => e.evidenceType === 'TRANSACTION')) {
      missingItems.push('Bank statement ledger confirmation (SWIFT / RTGS wire records)');
    }
    if (entity?.isPEP && !evidences.some((e) => e.title.toLowerCase().includes('pep'))) {
      missingItems.push('Enhanced Due Diligence (EDD) Declaration for PEP ownership');
    }
    if (txns.some((t) => t.amount >= 10000000) && !evidences.some((e) => e.title.toLowerCase().includes('contract'))) {
      missingItems.push('Commercial sales invoice or procurement agreement for transactions > ₹1 Crore');
    }

    let answer = '';
    if (missingItems.length > 0) {
      answer = `Identified **${missingItems.length} missing forensic evidence items** recommended to complete this dossier:\n\n`;
      missingItems.forEach((item, idx) => {
        answer += `${idx + 1}. **${item}**\n`;
      });
    } else {
      answer = `The case dossier contains comprehensive primary entity records, bank ledgers, and forensic evidence. No critical evidence gaps detected.`;
    }

    return {
      question: question || 'What evidence is missing?',
      answer,
      confidence: 'SUPPORTED',
      evidence: [],
      keyDrivers: missingItems.map((item) => ({
        factor: item,
        impact: 'Gap',
        description: 'Recommended for regulatory evidentiary standard',
        source: 'INVESTIGATION_ASSISTANT',
      })),
      suggestedNextSteps: missingItems.map((item) => `Docket ${item}`),
      relatedEntities: [entity?.name || 'Subject Entity'],
      relatedTransactions: [],
      relatedFindings: [],
      generatedAt: new Date().toISOString(),
    };
  }

  private handleCustomQuery(
    context: InvestigationContext,
    question: string,
    rawQuery: string
  ): AssistantResponse {
    const qLower = rawQuery.toLowerCase();
    const entity = context.primaryEntity;
    const caseDetails = context.caseDetails;

    // Check if query matches known attributes
    if (qLower.includes('tax') || qLower.includes('pan') || qLower.includes('gst')) {
      const taxId = entity?.taxId || 'Not recorded';
      return {
        question,
        answer: `Tax identification for ${entity?.name || 'Subject'}: **${taxId}** (Jurisdiction: ${entity?.jurisdiction || 'India'}).`,
        confidence: entity?.taxId ? 'SUPPORTED' : 'INSUFFICIENT_EVIDENCE',
        evidence: [],
        keyDrivers: [],
        suggestedNextSteps: ['Verify tax status with Income Tax / GST portal'],
        relatedEntities: [entity?.name || ''],
        relatedTransactions: [],
        relatedFindings: [],
        generatedAt: new Date().toISOString(),
      };
    }

    if (qLower.includes('account') || qLower.includes('bank')) {
      const accounts = entity?.accounts || [];
      return {
        question,
        answer: `Primary entity **${entity?.name}** holds **${accounts.length} known bank accounts**: ${accounts.map((a) => `${a.bankName} (${a.accountNumber})`).join(', ')}.`,
        confidence: 'SUPPORTED',
        evidence: [],
        keyDrivers: [],
        suggestedNextSteps: ['Review account balances and inward/outward velocities'],
        relatedEntities: [entity?.name || ''],
        relatedTransactions: [],
        relatedFindings: accounts.map((a) => a.accountNumber),
        generatedAt: new Date().toISOString(),
      };
    }

    // Default safe degradation: strict non-hallucination guarantee
    return {
      question,
      answer: `FinTrace does not have enough evidence to determine this with certainty. Please review the structured tabs (Evidence, Transactions, Network, Risk) or select one of the predefined investigation questions.`,
      confidence: 'INSUFFICIENT_EVIDENCE',
      evidence: [],
      keyDrivers: [],
      suggestedNextSteps: [
        'Try asking "Why is this case risky?" or "Summarize this case."',
        'Check the Network tab to visualize fund routing.',
      ],
      relatedEntities: [entity?.name || ''],
      relatedTransactions: [],
      relatedFindings: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

export const investigationAssistant = new InvestigationAssistant();
