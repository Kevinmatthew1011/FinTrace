export interface XAIReasoning {
  summary: string;
  keyDrivers: Array<{
    feature: string;
    impactPercentage: number;
    description: string;
  }>;
  suggestedAction: string;
  confidenceScore: number;
}

export interface IXAIService {
  generateReasoning(entityId: string, riskData: unknown): Promise<XAIReasoning>;
}

export class XAIServiceStub implements IXAIService {
  async generateReasoning(_entityId: string, _riskData: unknown): Promise<XAIReasoning> {
    return {
      summary: 'Entity displays classic Smurfing/Mule Layering topology with INR 18.5L dispersed across 14 micro-accounts within 18 minutes.',
      keyDrivers: [
        {
          feature: 'Transaction Velocity',
          impactPercentage: 42,
          description: '14 outgoing transfers in < 20 mins exceeding baseline by 820%.',
        },
        {
          feature: 'Structuring Anomaly',
          impactPercentage: 33,
          description: '92% of transfers clustered just below reporting limit (INR 49,000 - 49,800).',
        },
        {
          feature: 'Graph Proximity',
          impactPercentage: 25,
          description: '1-hop adjacency to known synthetic identity syndicate.',
        },
      ],
      suggestedAction: 'Freeze target intermediary accounts and request KYC audit on beneficiary cluster.',
      confidenceScore: 0.94,
    };
  }
}

export const xaiService = new XAIServiceStub();
