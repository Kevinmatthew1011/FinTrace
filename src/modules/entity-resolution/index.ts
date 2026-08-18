export interface EntityCandidate {
  name: string;
  taxIdentifier?: string;
  phone?: string;
  address?: string;
  bankAccounts: string[];
}

export interface ResolvedEntityMatch {
  entityId: string;
  confidenceScore: number; // 0.0 - 1.0
  matchedFields: string[];
  isNewEntity: boolean;
}

export interface IEntityResolutionService {
  resolveEntity(candidate: EntityCandidate): Promise<ResolvedEntityMatch>;
  fuzzyMatchName(nameA: string, nameB: string): number;
}

export class EntityResolutionServiceStub implements IEntityResolutionService {
  fuzzyMatchName(nameA: string, nameB: string): number {
    const cleanA = nameA.toLowerCase().trim();
    const cleanB = nameB.toLowerCase().trim();
    if (cleanA === cleanB) return 1.0;
    if (cleanA.includes(cleanB) || cleanB.includes(cleanA)) return 0.85;
    return 0.2;
  }

  async resolveEntity(candidate: EntityCandidate): Promise<ResolvedEntityMatch> {
    return {
      entityId: `ENT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      confidenceScore: candidate.taxIdentifier ? 0.98 : 0.75,
      matchedFields: candidate.taxIdentifier ? ['taxIdentifier', 'name'] : ['name'],
      isNewEntity: false,
    };
  }
}

export const entityResolutionService = new EntityResolutionServiceStub();
