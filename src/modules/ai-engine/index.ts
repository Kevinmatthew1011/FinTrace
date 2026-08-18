import { featureEngine } from './featureEngine';
import { anomalyEngine } from './anomalyEngine';
import { fraudPredictor, AI_MODEL_NAME, AI_MODEL_VERSION } from './fraudPredictor';
import { patternDiscoveryService } from './patternDiscovery';
import { riskFusionEngine } from './riskFusion';
import { explainabilityService } from './explainability';
import { aiPersistenceService } from './aiPersistence';
import {
  FullAIAssessment,
  AIOverviewStats,
  SuspiciousPattern,
  AIAssessmentTargetType,
  AIClassification,
} from './aiTypes';
import { prisma } from '@/lib/prisma';

export * from './aiTypes';
export * from './featureEngine';
export * from './anomalyEngine';
export * from './fraudPredictor';
export * from './patternDiscovery';
export * from './riskFusion';
export * from './explainability';
export * from './aiPersistence';

export class AIFraudEngineService {
  /**
   * Run end-to-end AI fraud detection on a transaction
   */
  async assessTransactionAI(transactionId: string): Promise<FullAIAssessment> {
    // 1. Extract deterministic multi-dimensional features
    const { features, baseline, targetInfo } = await featureEngine.extractTransactionFeatures(transactionId);

    // 2. Run Anomaly Detection Engine
    const anomalyResult = anomalyEngine.detectAnomalies(features, baseline);

    // 3. Run AI Fraud Predictor (Neural Ensemble)
    const predictionResult = fraudPredictor.predictFraud(features, anomalyResult);

    // 4. Run Risk Fusion (Phase 4 Deterministic + Phase 3 Graph + Phase 5 AI + Anomaly)
    const fusionResult = riskFusionEngine.fuseRisk(
      features.deterministicRiskScore,
      features.compositeNetworkRisk,
      predictionResult.fraudScore,
      anomalyResult.anomalyScore
    );

    // 5. Discover localized emergent fraud patterns
    const suspiciousPatterns = await patternDiscoveryService.discoverPatterns(features, transactionId);

    // 6. Generate Explainable AI Evidence & Action Rationale
    const { evidence, suggestedAction } = explainabilityService.generateEvidence(
      features,
      anomalyResult,
      predictionResult,
      fusionResult
    );

    const assessment: FullAIAssessment = {
      id: `ai-assess-tx-${transactionId}`,
      targetType: 'TRANSACTION',
      targetId: transactionId,
      targetLabel: targetInfo.referenceNumber,
      targetSublabel: `₹${targetInfo.amount.toLocaleString('en-IN')} • ${targetInfo.channel} • ${targetInfo.senderEntityName} ➔ ${targetInfo.receiverEntityName}`,
      fraudProbability: predictionResult.fraudProbability,
      fraudScore: predictionResult.fraudScore,
      anomalyScore: anomalyResult.anomalyScore,
      classification: predictionResult.classification,
      confidence: predictionResult.confidence,
      deterministicRiskScore: features.deterministicRiskScore,
      networkRiskScore: features.compositeNetworkRisk,
      combinedScore: fusionResult.fusedScore,
      combinedRiskLevel: fusionResult.fusedLevel,
      evidence,
      featureSnapshot: features,
      anomalyResult,
      predictionResult,
      fusionResult,
      suspiciousPatterns,
      suggestedAction,
      modelMetadata: {
        modelName: AI_MODEL_NAME,
        modelVersion: AI_MODEL_VERSION,
      },
      createdAt: new Date().toISOString(),
    };

    // Persist assessment to PostgreSQL asynchronously
    await aiPersistenceService.saveAssessment(assessment);

    return assessment;
  }

  /**
   * Run end-to-end AI fraud detection on an Entity
   */
  async assessEntityAI(entityId: string): Promise<FullAIAssessment> {
    // 1. Extract entity-level aggregated features
    const { features, baseline, entity } = await featureEngine.extractEntityFeatures(entityId);

    // 2. Run Anomaly Detection Engine
    const anomalyResult = anomalyEngine.detectAnomalies(features, baseline);

    // 3. Run AI Fraud Predictor
    const predictionResult = fraudPredictor.predictFraud(features, anomalyResult);

    // 4. Run Risk Fusion
    const fusionResult = riskFusionEngine.fuseRisk(
      features.deterministicRiskScore,
      features.compositeNetworkRisk,
      predictionResult.fraudScore,
      anomalyResult.anomalyScore
    );

    // 5. Discover patterns
    const suspiciousPatterns = await patternDiscoveryService.discoverPatterns(features, entityId);

    // 6. Generate Explainability
    const { evidence, suggestedAction } = explainabilityService.generateEvidence(
      features,
      anomalyResult,
      predictionResult,
      fusionResult
    );

    const assessment: FullAIAssessment = {
      id: `ai-assess-ent-${entityId}`,
      targetType: 'ENTITY',
      targetId: entityId,
      targetLabel: entity.name,
      targetSublabel: `${entity.entityType} • PAN/GST: ${entity.taxIdentifier} • ${entity.accountCount} Accounts`,
      fraudProbability: predictionResult.fraudProbability,
      fraudScore: predictionResult.fraudScore,
      anomalyScore: anomalyResult.anomalyScore,
      classification: predictionResult.classification,
      confidence: predictionResult.confidence,
      deterministicRiskScore: features.deterministicRiskScore,
      networkRiskScore: features.compositeNetworkRisk,
      combinedScore: fusionResult.fusedScore,
      combinedRiskLevel: fusionResult.fusedLevel,
      evidence,
      featureSnapshot: features,
      anomalyResult,
      predictionResult,
      fusionResult,
      suspiciousPatterns,
      suggestedAction,
      modelMetadata: {
        modelName: AI_MODEL_NAME,
        modelVersion: AI_MODEL_VERSION,
      },
      createdAt: new Date().toISOString(),
    };

    await aiPersistenceService.saveAssessment(assessment);

    return assessment;
  }

  /**
   * Run AI fraud detection on an Account
   */
  async assessAccountAI(accountId: string): Promise<FullAIAssessment> {
    const acc = await prisma.account.findUnique({
      where: { id: accountId },
      include: { entity: true },
    });

    if (!acc) throw new Error(`Account not found: ${accountId}`);

    // Delegate to entity analysis and specialize for account
    const entityAssessment = await this.assessEntityAI(acc.entityId);

    const assessment: FullAIAssessment = {
      ...entityAssessment,
      id: `ai-assess-acc-${accountId}`,
      targetType: 'ACCOUNT',
      targetId: accountId,
      targetLabel: `${acc.bankName} - ${acc.accountNumber}`,
      targetSublabel: `Type: ${acc.accountType} • Entity: ${acc.entity.name} • Bal: ₹${Number(acc.currentBalance).toLocaleString('en-IN')}`,
    };

    await aiPersistenceService.saveAssessment(assessment);

    return assessment;
  }

  /**
   * Run network-level AI analysis
   */
  async assessNetworkAI(entityId: string): Promise<{
    networkAssessment: FullAIAssessment;
    discoveredPatterns: SuspiciousPattern[];
  }> {
    const networkAssessment = await this.assessEntityAI(entityId);
    const discoveredPatterns = await patternDiscoveryService.findGlobalPatterns();

    return {
      networkAssessment,
      discoveredPatterns,
    };
  }

  /**
   * Retrieve AI Overview telemetry
   */
  async getAIOverview(): Promise<AIOverviewStats> {
    return aiPersistenceService.getOverviewStats();
  }

  /**
   * Retrieve discovered patterns
   */
  async getDiscoveredPatterns(): Promise<SuspiciousPattern[]> {
    return patternDiscoveryService.findGlobalPatterns();
  }

  /**
   * Retrieve AI history
   */
  async getAIHistory(options: {
    targetType?: AIAssessmentTargetType;
    targetId?: string;
    classification?: AIClassification;
    limit?: number;
  }) {
    return aiPersistenceService.getAssessmentHistory(options);
  }
}

export const aiFraudEngineService = new AIFraudEngineService();
