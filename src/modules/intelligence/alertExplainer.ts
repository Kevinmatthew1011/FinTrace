import { evidenceCollector } from './evidenceCollector';
import {
  AlertExplanationPayload,
  GroundedEvidenceReference,
} from './intelligenceTypes';

export class AlertExplainer {
  /**
   * Explain why a specific fraud alert was generated
   */
  async explainAlert(alertId: string): Promise<AlertExplanationPayload> {
    const alert = await evidenceCollector.collectAlertContext(alertId);
    const indicators = Array.isArray(alert.indicators)
      ? (alert.indicators as string[])
      : typeof alert.indicators === 'string'
      ? [alert.indicators]
      : [];

    const evidenceReferences: GroundedEvidenceReference[] = [];

    indicators.forEach((ind, idx) => {
      evidenceReferences.push({
        id: `EV-ALT-IND-${idx + 1}`,
        type: 'TRIGGERING_INDICATOR',
        title: `Indicator: ${ind.replace(/_/g, ' ')}`,
        source: 'PHASE5_ALERT_ENGINE',
        sourceId: alert.id,
        snippet: `Triggered detection pattern: ${ind}`,
        severity: alert.severity,
      });
    });

    const entityName = alert.sourceEntity?.name || 'Subject Entity';
    const txCount = alert.transactions.length;

    let narrative = `Alert **${alert.alertNumber}** (${alert.severity}) was raised by the Alert Generation Engine under typology **${alert.alertType.replace(/_/g, ' ')}**.\n\n`;
    narrative += `**Root Cause & Indicators:**\n`;
    narrative += `• Subject Entity: **${entityName}**\n`;
    narrative += `• Linked Transactions: **${txCount} records**\n`;
    narrative += `• Description: ${alert.description}\n`;

    if (indicators.length > 0) {
      narrative += `• Triggered Flags: ${indicators.join(', ')}\n`;
    }

    return {
      alertNumber: alert.alertNumber,
      alertType: alert.alertType,
      severity: alert.severity,
      triggeringIndicators: indicators,
      relatedEntity: entityName,
      relatedTransactionCount: txCount,
      evidenceReferences,
      narrativeExplanation: narrative,
    };
  }
}

export const alertExplainer = new AlertExplainer();
