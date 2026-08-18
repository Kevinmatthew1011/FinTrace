import { DEMO_TRANSACTIONS } from './transactions';
import { DEMO_ALERTS } from './alerts';
import { DEMO_ENTITIES } from './entities';
import { DEMO_INVESTIGATIONS } from './investigations';
import { DEMO_NETWORK_GRAPH } from './network';
import {
  DEMO_KPI_SUMMARY,
  DEMO_ACTIVITY_24H,
  DEMO_ACTIVITY_7D,
  DEMO_ACTIVITY_30D,
  DEMO_RISK_DISTRIBUTION,
  DEMO_REGIONAL_ACTIVITY,
} from './analytics';
import { Transaction, Alert, Entity, Investigation, RiskLevel } from '@/types/fraud';

export interface TransactionFilterParams {
  riskLevel?: RiskLevel | 'ALL';
  status?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  limit?: number;
}

export class DemoDataService {
  getKPISummary() {
    return DEMO_KPI_SUMMARY;
  }

  getActivityData(timeframe: '24H' | '7D' | '30D') {
    switch (timeframe) {
      case '24H':
        return DEMO_ACTIVITY_24H;
      case '7D':
        return DEMO_ACTIVITY_7D;
      case '30D':
        return DEMO_ACTIVITY_30D;
      default:
        return DEMO_ACTIVITY_24H;
    }
  }

  getRiskDistribution() {
    return DEMO_RISK_DISTRIBUTION;
  }

  getRegionalActivity() {
    return DEMO_REGIONAL_ACTIVITY;
  }

  getTransactions(params?: TransactionFilterParams): Transaction[] {
    let result = [...DEMO_TRANSACTIONS];

    if (!params) return result;

    if (params.riskLevel && params.riskLevel !== 'ALL') {
      result = result.filter((tx) => tx.riskLevel === params.riskLevel);
    }

    if (params.status && params.status !== 'ALL') {
      result = result.filter((tx) => tx.status === params.status);
    }

    if (params.minAmount !== undefined) {
      result = result.filter((tx) => tx.amount >= params.minAmount!);
    }

    if (params.maxAmount !== undefined) {
      result = result.filter((tx) => tx.amount <= params.maxAmount!);
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (tx) =>
          tx.referenceNumber.toLowerCase().includes(q) ||
          tx.senderAccount.toLowerCase().includes(q) ||
          tx.receiverAccount.toLowerCase().includes(q) ||
          tx.senderEntityName.toLowerCase().includes(q) ||
          tx.receiverEntityName.toLowerCase().includes(q) ||
          tx.senderEntityId.toLowerCase().includes(q) ||
          tx.receiverEntityId.toLowerCase().includes(q)
      );
    }

    if (params.limit) {
      result = result.slice(0, params.limit);
    }

    return result;
  }

  getAlerts(status?: string, severity?: string): Alert[] {
    let result = [...DEMO_ALERTS];
    if (status && status !== 'ALL') {
      result = result.filter((a) => a.status === status);
    }
    if (severity && severity !== 'ALL') {
      result = result.filter((a) => a.severity === severity);
    }
    return result;
  }

  getEntities(riskLevel?: RiskLevel | 'ALL'): Entity[] {
    let result = [...DEMO_ENTITIES];
    if (riskLevel && riskLevel !== 'ALL') {
      result = result.filter((e) => e.riskLevel === riskLevel);
    }
    return result;
  }

  getInvestigations(): Investigation[] {
    return DEMO_INVESTIGATIONS;
  }

  getNetworkGraph() {
    return DEMO_NETWORK_GRAPH;
  }

  searchAll(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { transactions: [], entities: [], alerts: [], investigations: [] };
    }

    const transactions = DEMO_TRANSACTIONS.filter(
      (tx) =>
        tx.referenceNumber.toLowerCase().includes(q) ||
        tx.senderAccount.toLowerCase().includes(q) ||
        tx.receiverAccount.toLowerCase().includes(q) ||
        tx.senderEntityName.toLowerCase().includes(q) ||
        tx.receiverEntityName.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q)
    );

    const entities = DEMO_ENTITIES.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.taxIdentifier.toLowerCase().includes(q)
    );

    const alerts = DEMO_ALERTS.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.alertNumber.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.entityName.toLowerCase().includes(q) ||
        a.accountId.toLowerCase().includes(q)
    );

    const investigations = DEMO_INVESTIGATIONS.filter(
      (inv) =>
        inv.id.toLowerCase().includes(q) ||
        inv.caseNumber.toLowerCase().includes(q) ||
        inv.title.toLowerCase().includes(q) ||
        inv.assignedInvestigator.toLowerCase().includes(q)
    );

    return { transactions, entities, alerts, investigations };
  }
}

export const demoDataService = new DemoDataService();
