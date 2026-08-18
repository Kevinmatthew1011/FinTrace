export interface InvestigatorCase {
  id: string;
  caseNumber: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'ASSIGNED' | 'UNDER_REVIEW' | 'EVIDENCE_SUBMITTED' | 'CLOSED';
  leadInvestigator: string;
  alertCount: number;
  totalFlaggedAmount: number;
  createdAt: string;
}

export interface ICasesService {
  listCases(): Promise<InvestigatorCase[]>;
  getCaseDetails(caseId: string): Promise<InvestigatorCase | null>;
}

export class CasesServiceStub implements ICasesService {
  async listCases(): Promise<InvestigatorCase[]> {
    return [
      {
        id: 'case-001',
        caseNumber: 'CASE-2026-0881',
        title: 'Syndicate Layering & Mule Ring Alpha',
        priority: 'URGENT',
        status: 'UNDER_REVIEW',
        leadInvestigator: 'Agent Kiddo',
        alertCount: 7,
        totalFlaggedAmount: 4850000,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async getCaseDetails(caseId: string): Promise<InvestigatorCase | null> {
    const list = await this.listCases();
    return list.find((c) => c.id === caseId) ?? null;
  }
}

export const casesService = new CasesServiceStub();
