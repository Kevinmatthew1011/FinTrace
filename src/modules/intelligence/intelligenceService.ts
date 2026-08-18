import { evidenceCollector } from './evidenceCollector';
import { riskExplainer } from './riskExplainer';
import { networkExplainer } from './networkExplainer';
import { transactionExplainer } from './transactionExplainer';
import { alertExplainer } from './alertExplainer';
import { caseSummarizer } from './caseSummarizer';
import { investigationAssistant } from './investigationAssistant';
import {
  AlertExplanationPayload,
  AssistantResponse,
  CaseSummaryPayload,
  InvestigationContext,
  NetworkExplanationPayload,
  RiskExplanationPayload,
  TransactionExplanationPayload,
} from './intelligenceTypes';

export class IntelligenceService {
  /**
   * Collect structured context for a case
   */
  async collectContext(caseId: string): Promise<InvestigationContext> {
    return evidenceCollector.collectInvestigationContext(caseId);
  }

  /**
   * Explain multi-factor case risk
   */
  async explainRisk(caseId: string): Promise<RiskExplanationPayload> {
    const context = await this.collectContext(caseId);
    return riskExplainer.explainCaseRisk(context);
  }

  /**
   * Explain money flow network topologies
   */
  async explainNetwork(caseId: string): Promise<NetworkExplanationPayload> {
    const context = await this.collectContext(caseId);
    return networkExplainer.explainCaseNetwork(context);
  }

  /**
   * Explain transaction baseline deviations
   */
  async explainTransaction(transactionId: string): Promise<TransactionExplanationPayload> {
    return transactionExplainer.explainTransaction(transactionId);
  }

  /**
   * Explain fraud alert root-cause
   */
  async explainAlert(alertId: string): Promise<AlertExplanationPayload> {
    return alertExplainer.explainAlert(alertId);
  }

  /**
   * Generate an executive case summary
   */
  async summarizeCase(caseId: string): Promise<CaseSummaryPayload> {
    const context = await this.collectContext(caseId);
    return caseSummarizer.generateCaseSummary(context);
  }

  /**
   * Ask the Investigation Assistant
   */
  async askAssistant(
    caseId: string,
    question: string,
    customQuery?: string,
    actorUserId?: string
  ): Promise<AssistantResponse> {
    return investigationAssistant.answerInvestigationQuestion(
      caseId,
      question,
      customQuery,
      actorUserId
    );
  }
}

export const intelligenceService = new IntelligenceService();
