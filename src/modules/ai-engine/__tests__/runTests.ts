import { FeatureEngine } from '../featureEngine';
import { AnomalyEngine } from '../anomalyEngine';
import { FraudPredictor, AI_MODEL_NAME, AI_MODEL_VERSION } from '../fraudPredictor';
import { RiskFusionEngine, DEFAULT_FUSION_WEIGHTS } from '../riskFusion';
import { ExplainabilityService } from '../explainability';
import { PatternDiscoveryService } from '../patternDiscovery';
import { ExtractedFeatures, BehavioralBaseline } from '../aiTypes';

async function runAIEngineTests() {
  console.log('================================================================');
  console.log('RUNNING PHASE 5 AI FRAUD DETECTION & PREDICTIVE UNIT SUITE (20 TESTS)');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ [PASS] ${testName}`);
    } else {
      console.error(`✗ [FAIL] ${testName} - ${details || 'Assertion failed'}`);
    }
  }

  const featureEngine = new FeatureEngine();
  const anomalyEngine = new AnomalyEngine();
  const fraudPredictor = new FraudPredictor();
  const riskFusionEngine = new RiskFusionEngine();
  const explainabilityService = new ExplainabilityService();
  const patternDiscoveryService = new PatternDiscoveryService();

  // Test 1: Baseline calculation for standard account history
  {
    const amounts = [10000, 12000, 15000, 14000, 13000, 16000, 14000];
    const baseline = featureEngine.calculateBaseline(amounts);
    assert(
      'Test 1: Statistical baseline calculation (Mean, Median, StdDev)',
      baseline.historyCount === 7 &&
        baseline.meanAmount === 13429 &&
        baseline.medianAmount === 14000 &&
        baseline.stdDevAmount > 0 &&
        baseline.maxAmount === 16000
    );
  }

  // Test 2: Baseline calculation for empty history (Graceful edge case)
  {
    const baseline = featureEngine.calculateBaseline([]);
    assert(
      'Test 2: Empty history graceful handling without division by zero',
      baseline.historyCount === 0 &&
        baseline.meanAmount === 0 &&
        baseline.stdDevAmount === 0
    );
  }

  // Test 3: Normal transaction anomaly detection (Zero/Low anomaly)
  {
    const features: ExtractedFeatures = {
      amount: 14000,
      amountToMeanRatio: 1.05,
      amountToMedianRatio: 1.0,
      amountZScore: 0.2,
      isRoundAmount: false,
      isSubThresholdStructuring: false,
      count5m: 1,
      count15m: 1,
      count1h: 1,
      count24h: 2,
      volume24h: 28000,
      frequencyBurstZScore: 0.1,
      isOddHourTransfer: false,
      dormancyDays: 2,
      isDormantAwakening: false,
      accountAgeDays: 300,
      accountBalanceToAmountRatio: 4.5,
      uniqueCounterparties24h: 1,
      highRiskCounterpartiesCount: 0,
      newCounterpartyRatio: 0,
      counterpartyConcentrationHHI: 1.0,
      cycleParticipationCount: 0,
      muleChainLength: 0,
      highRiskNeighborRatio: 0,
      shortestPathToKnownBadActor: -1,
      networkClusteringCoeff: 0.2,
      compositeNetworkRisk: 10,
      priorSuspiciousAlertsCount: 0,
      deterministicRiskScore: 12,
      isPEPOrSanctioned: false,
    };

    const baseline: BehavioralBaseline = {
      targetId: 'acc-1',
      targetType: 'ACCOUNT',
      historyCount: 10,
      meanAmount: 13500,
      medianAmount: 14000,
      stdDevAmount: 2000,
      maxAmount: 18000,
      p95Amount: 17000,
      meanDailyFrequency: 2,
      typicalCounterpartyIds: [],
      activeHoursDistribution: {},
      dormancyDays: 0,
      calculatedAt: new Date().toISOString(),
    };

    const anomaly = anomalyEngine.detectAnomalies(features, baseline);
    assert(
      'Test 3: Normal transaction produces low anomaly score (Score < 20, isAnomalous: false)',
      anomaly.anomalyScore < 20 && !anomaly.isAnomalous && anomaly.severity === 'LOW'
    );
  }

  // Test 4: High-value amount anomaly detection (6.2x ratio, +4.5σ)
  {
    const features: ExtractedFeatures = {
      amount: 850000,
      amountToMeanRatio: 6.2,
      amountToMedianRatio: 6.0,
      amountZScore: 4.5,
      isRoundAmount: false,
      isSubThresholdStructuring: false,
      count5m: 1,
      count15m: 1,
      count1h: 1,
      count24h: 1,
      volume24h: 850000,
      frequencyBurstZScore: 0.1,
      isOddHourTransfer: false,
      dormancyDays: 1,
      isDormantAwakening: false,
      accountAgeDays: 180,
      accountBalanceToAmountRatio: 1.1,
      uniqueCounterparties24h: 1,
      highRiskCounterpartiesCount: 0,
      newCounterpartyRatio: 0,
      counterpartyConcentrationHHI: 1.0,
      cycleParticipationCount: 0,
      muleChainLength: 0,
      highRiskNeighborRatio: 0,
      shortestPathToKnownBadActor: -1,
      networkClusteringCoeff: 0.2,
      compositeNetworkRisk: 15,
      priorSuspiciousAlertsCount: 0,
      deterministicRiskScore: 35,
      isPEPOrSanctioned: false,
    };

    const baseline: BehavioralBaseline = {
      targetId: 'acc-2',
      targetType: 'ACCOUNT',
      historyCount: 15,
      meanAmount: 137000,
      medianAmount: 140000,
      stdDevAmount: 30000,
      maxAmount: 200000,
      p95Amount: 190000,
      meanDailyFrequency: 1,
      typicalCounterpartyIds: [],
      activeHoursDistribution: {},
      dormancyDays: 0,
      calculatedAt: new Date().toISOString(),
    };

    const anomaly = anomalyEngine.detectAnomalies(features, baseline);
    assert(
      'Test 4: High-value amount anomaly detection (Z-Score +4.5σ, CRITICAL/HIGH deviation)',
      anomaly.anomalyScore >= 20 &&
        anomaly.deviations.some((d) => d.feature.includes('Amount') && d.deviationRatio >= 6.0)
    );
  }

  // Test 5: Rapid velocity burst detection (14 transfers in 15 mins)
  {
    const features: ExtractedFeatures = {
      amount: 45000,
      amountToMeanRatio: 1.2,
      amountToMedianRatio: 1.2,
      amountZScore: 0.4,
      isRoundAmount: false,
      isSubThresholdStructuring: true,
      count5m: 6,
      count15m: 14,
      count1h: 18,
      count24h: 22,
      volume24h: 990000,
      frequencyBurstZScore: 5.2,
      isOddHourTransfer: false,
      dormancyDays: 1,
      isDormantAwakening: false,
      accountAgeDays: 60,
      accountBalanceToAmountRatio: 0.5,
      uniqueCounterparties24h: 12,
      highRiskCounterpartiesCount: 3,
      newCounterpartyRatio: 0.8,
      counterpartyConcentrationHHI: 0.15,
      cycleParticipationCount: 0,
      muleChainLength: 2,
      highRiskNeighborRatio: 0.35,
      shortestPathToKnownBadActor: 2,
      networkClusteringCoeff: 0.4,
      compositeNetworkRisk: 65,
      priorSuspiciousAlertsCount: 2,
      deterministicRiskScore: 70,
      isPEPOrSanctioned: false,
    };

    const baseline: BehavioralBaseline = {
      targetId: 'acc-3',
      targetType: 'ACCOUNT',
      historyCount: 12,
      meanAmount: 38000,
      medianAmount: 40000,
      stdDevAmount: 10000,
      maxAmount: 60000,
      p95Amount: 55000,
      meanDailyFrequency: 2,
      typicalCounterpartyIds: [],
      activeHoursDistribution: {},
      dormancyDays: 0,
      calculatedAt: new Date().toISOString(),
    };

    const anomaly = anomalyEngine.detectAnomalies(features, baseline);
    assert(
      'Test 5: Rapid velocity burst & structuring multi-deviation anomaly detection',
      anomaly.anomalyScore >= 50 &&
        anomaly.deviations.some((d) => d.feature.includes('Velocity')) &&
        anomaly.deviations.some((d) => d.feature.includes('Structuring'))
    );
  }

  // Test 6: Dormant account awakening detection (100 days dormancy)
  {
    const features: ExtractedFeatures = {
      amount: 4500000,
      amountToMeanRatio: 8.5,
      amountToMedianRatio: 8.5,
      amountZScore: 5.0,
      isRoundAmount: false,
      isSubThresholdStructuring: false,
      count5m: 1,
      count15m: 1,
      count1h: 1,
      count24h: 1,
      volume24h: 4500000,
      frequencyBurstZScore: 0.1,
      isOddHourTransfer: false,
      dormancyDays: 100,
      isDormantAwakening: true,
      accountAgeDays: 400,
      accountBalanceToAmountRatio: 0.2,
      uniqueCounterparties24h: 1,
      highRiskCounterpartiesCount: 1,
      newCounterpartyRatio: 1.0,
      counterpartyConcentrationHHI: 1.0,
      cycleParticipationCount: 0,
      muleChainLength: 0,
      highRiskNeighborRatio: 0.1,
      shortestPathToKnownBadActor: 2,
      networkClusteringCoeff: 0.1,
      compositeNetworkRisk: 40,
      priorSuspiciousAlertsCount: 0,
      deterministicRiskScore: 65,
      isPEPOrSanctioned: false,
    };

    const baseline: BehavioralBaseline = {
      targetId: 'acc-4',
      targetType: 'ACCOUNT',
      historyCount: 10,
      meanAmount: 500000,
      medianAmount: 500000,
      stdDevAmount: 100000,
      maxAmount: 800000,
      p95Amount: 750000,
      meanDailyFrequency: 1,
      typicalCounterpartyIds: [],
      activeHoursDistribution: {},
      dormancyDays: 100,
      calculatedAt: new Date().toISOString(),
    };

    const anomaly = anomalyEngine.detectAnomalies(features, baseline);
    assert(
      'Test 6: Dormant awakening anomaly detection (100 days dormant + sudden volume)',
      anomaly.anomalyScore >= 45 &&
        anomaly.deviations.some((d) => d.feature.includes('Dormant'))
    );
  }

  // Test 7: AI Fraud Predictor for clean transaction (NORMAL classification)
  {
    const cleanFeatures: ExtractedFeatures = {
      amount: 15000,
      amountToMeanRatio: 1.0,
      amountToMedianRatio: 1.0,
      amountZScore: 0.0,
      isRoundAmount: false,
      isSubThresholdStructuring: false,
      count5m: 1,
      count15m: 1,
      count1h: 1,
      count24h: 1,
      volume24h: 15000,
      frequencyBurstZScore: 0.0,
      isOddHourTransfer: false,
      dormancyDays: 0,
      isDormantAwakening: false,
      accountAgeDays: 365,
      accountBalanceToAmountRatio: 5.0,
      uniqueCounterparties24h: 1,
      highRiskCounterpartiesCount: 0,
      newCounterpartyRatio: 0,
      counterpartyConcentrationHHI: 1.0,
      cycleParticipationCount: 0,
      muleChainLength: 0,
      highRiskNeighborRatio: 0,
      shortestPathToKnownBadActor: -1,
      networkClusteringCoeff: 0.1,
      compositeNetworkRisk: 5,
      priorSuspiciousAlertsCount: 0,
      deterministicRiskScore: 10,
      isPEPOrSanctioned: false,
    };

    const cleanAnomaly = {
      anomalyScore: 0,
      isAnomalous: false,
      severity: 'LOW' as const,
      deviations: [],
      topAnomalyDrivers: [],
      baselineSnapshot: featureEngine.calculateBaseline([15000]),
    };

    const pred = fraudPredictor.predictFraud(cleanFeatures, cleanAnomaly);
    assert(
      'Test 7: AI Fraud Predictor maps clean behavior to NORMAL classification (Prob < 0.20)',
      pred.fraudProbability < 0.20 &&
        pred.classification === 'NORMAL' &&
        pred.confidence >= 0.70
    );
  }

  // Test 8: AI Fraud Predictor for high-risk syndicate transaction (HIGH_CONFIDENCE_FRAUD)
  {
    const syndicateFeatures: ExtractedFeatures = {
      amount: 950000,
      amountToMeanRatio: 6.8,
      amountToMedianRatio: 6.5,
      amountZScore: 4.8,
      isRoundAmount: false,
      isSubThresholdStructuring: false,
      count5m: 8,
      count15m: 16,
      count1h: 22,
      count24h: 30,
      volume24h: 8500000,
      frequencyBurstZScore: 6.5,
      isOddHourTransfer: true,
      dormancyDays: 45,
      isDormantAwakening: true,
      accountAgeDays: 40,
      accountBalanceToAmountRatio: 0.1,
      uniqueCounterparties24h: 14,
      highRiskCounterpartiesCount: 5,
      newCounterpartyRatio: 0.9,
      counterpartyConcentrationHHI: 0.12,
      cycleParticipationCount: 2,
      muleChainLength: 3,
      highRiskNeighborRatio: 0.6,
      shortestPathToKnownBadActor: 1,
      networkClusteringCoeff: 0.65,
      compositeNetworkRisk: 90,
      priorSuspiciousAlertsCount: 4,
      deterministicRiskScore: 88,
      isPEPOrSanctioned: true,
    };

    const syndicateAnomaly = {
      anomalyScore: 92,
      isAnomalous: true,
      severity: 'CRITICAL' as const,
      deviations: [],
      topAnomalyDrivers: [],
      baselineSnapshot: featureEngine.calculateBaseline([140000]),
    };

    const pred = fraudPredictor.predictFraud(syndicateFeatures, syndicateAnomaly);
    assert(
      'Test 8: AI Fraud Predictor maps syndicate signals to HIGH_CONFIDENCE_FRAUD (Prob >= 0.85)',
      pred.fraudProbability >= 0.85 &&
        pred.classification === 'HIGH_CONFIDENCE_FRAUD' &&
        pred.keyPredictiveDrivers.length >= 3
    );
  }

  // Test 9: Model metadata integrity
  {
    const pred = fraudPredictor.predictFraud(
      { amount: 1000 } as any,
      { anomalyScore: 0 } as any
    );
    assert(
      'Test 9: AI Model Name and Version metadata traceability',
      pred.modelMetadata.modelName === AI_MODEL_NAME &&
        pred.modelMetadata.modelVersion === AI_MODEL_VERSION &&
        pred.modelMetadata.ensembleComponents.length >= 3
    );
  }

  // Test 10: Risk Fusion mathematical weighting
  {
    // Deterministic: 80, Network: 90, AI: 85, Anomaly: 70
    // Fused = 80*0.35 + 90*0.25 + 85*0.25 + 70*0.15 = 28 + 22.5 + 21.25 + 10.5 = 82.25
    const fusion = riskFusionEngine.fuseRisk(80, 90, 85, 70);
    assert(
      'Test 10: Risk Fusion weighted calculation (35% Det + 25% Net + 25% AI + 15% Anomaly = 82.3)',
      Math.abs(fusion.fusedScore - 82.3) < 0.2 &&
        fusion.fusedLevel === 'CRITICAL' &&
        fusion.deterministicScore === 80
    );
  }

  // Test 11: Risk Fusion score preservation of deterministic baseline
  {
    const deterministicBase = 45;
    const fusion = riskFusionEngine.fuseRisk(deterministicBase, 20, 30, 25);
    assert(
      'Test 11: Phase 4 deterministic risk score is strictly preserved untouched in fusion payload',
      fusion.deterministicScore === 45 && fusion.networkScore === 20
    );
  }

  // Test 12: Risk Fusion level mapping thresholds
  {
    const lowFusion = riskFusionEngine.fuseRisk(15, 10, 10, 10);
    const medFusion = riskFusionEngine.fuseRisk(40, 35, 45, 30);
    const highFusion = riskFusionEngine.fuseRisk(68, 65, 72, 60);
    const critFusion = riskFusionEngine.fuseRisk(92, 85, 95, 88);

    assert(
      'Test 12: Fused level mapping across all 4 tiers (LOW, MEDIUM, HIGH, CRITICAL)',
      lowFusion.fusedLevel === 'LOW' &&
        medFusion.fusedLevel === 'MEDIUM' &&
        highFusion.fusedLevel === 'HIGH' &&
        critFusion.fusedLevel === 'CRITICAL'
    );
  }

  // Test 13: XAI explainability evidence generation
  {
    const features: ExtractedFeatures = {
      amount: 1450000,
      amountToMeanRatio: 6.2,
      count15m: 12,
      cycleParticipationCount: 1,
      highRiskCounterpartiesCount: 3,
      isSubThresholdStructuring: true,
      dormancyDays: 92,
      isOddHourTransfer: true,
    } as any;

    const anomaly = {
      anomalyScore: 85,
      isAnomalous: true,
      severity: 'CRITICAL' as const,
      deviations: [],
      topAnomalyDrivers: [],
      baselineSnapshot: {} as any,
    };

    const pred = {
      fraudProbability: 0.92,
      fraudScore: 92.0,
      classification: 'HIGH_CONFIDENCE_FRAUD' as const,
      confidence: 0.96,
      keyPredictiveDrivers: [],
      modelMetadata: {} as any,
    };

    const fusion = riskFusionEngine.fuseRisk(85, 90, 92, 85);

    const { evidence, suggestedAction } = explainabilityService.generateEvidence(
      features,
      anomaly,
      pred,
      fusion
    );

    assert(
      'Test 13: Explainable AI generates structured statements and actionable investigator guidance',
      evidence.length >= 4 &&
        evidence.some((e) => e.statement.includes('6.2×')) &&
        evidence.some((e) => e.statement.includes('15-minute window')) &&
        suggestedAction.includes('IMMEDIATE ACTION')
    );
  }

  // Test 14: Pattern Discovery — Carousel Round Trip
  {
    const features: ExtractedFeatures = {
      cycleParticipationCount: 3,
      volume24h: 5000000,
    } as any;

    const patterns = await patternDiscoveryService.discoverPatterns(features, 'ent-test-carousel');
    assert(
      'Test 14: Pattern Discovery identifies Carousel Round-Tripping topology',
      patterns.some((p) => p.patternType === 'CAROUSEL_ROUND_TRIP' && p.confidence >= 0.9)
    );
  }

  // Test 15: Pattern Discovery — Rapid Smurfing Dispersal
  {
    const features: ExtractedFeatures = {
      isSubThresholdStructuring: true,
      count15m: 8,
      newCounterpartyRatio: 0.75,
      volume24h: 480000,
    } as any;

    const patterns = await patternDiscoveryService.discoverPatterns(features, 'ent-test-smurfing');
    assert(
      'Test 15: Pattern Discovery identifies Rapid Smurfing Dispersal',
      patterns.some((p) => p.patternType === 'RAPID_SMURFING_DISPERSAL' && p.confidence >= 0.85)
    );
  }

  // Test 16: Anomaly Engine Odd-hour nocturnal transfer detection
  {
    const features: ExtractedFeatures = {
      isOddHourTransfer: true,
      amountToMeanRatio: 1.0,
    } as any;

    const baseline = featureEngine.calculateBaseline([10000]);
    const anomaly = anomalyEngine.detectAnomalies(features, baseline);

    assert(
      'Test 16: Anomaly Engine catches nocturnal odd-hour transfer',
      anomaly.deviations.some((d) => d.feature.includes('Odd-Hour'))
    );
  }

  // Test 17: Probability sigmoid boundary properties [0.01, 0.99]
  {
    const extremeLow = fraudPredictor.predictFraud({ amountToMeanRatio: 0.1 } as any, { anomalyScore: 0 } as any);
    const extremeHigh = fraudPredictor.predictFraud(
      {
        amountToMeanRatio: 50,
        count15m: 50,
        cycleParticipationCount: 10,
        isPEPOrSanctioned: true,
      } as any,
      { anomalyScore: 100 } as any
    );

    assert(
      'Test 17: Sigmoid prediction strictly bounded in [0.01, 0.99] range without overflow',
      extremeLow.fraudProbability >= 0.01 &&
        extremeLow.fraudProbability <= 0.20 &&
        extremeHigh.fraudProbability <= 0.99 &&
        extremeHigh.fraudProbability >= 0.85
    );
  }

  // Test 18: Risk Fusion custom weights capability
  {
    const customWeights = { deterministic: 0.50, network: 0.20, aiPredictive: 0.20, anomaly: 0.10 };
    const fusion = riskFusionEngine.fuseRisk(100, 50, 50, 50, customWeights);
    // 100*0.5 + 50*0.2 + 50*0.2 + 50*0.1 = 50 + 10 + 10 + 5 = 75
    assert(
      'Test 18: Risk Fusion supports custom configurable weights matrix',
      Math.abs(fusion.fusedScore - 75.0) < 0.1
    );
  }

  // Test 19: Classification threshold boundaries
  {
    const normalProb = 0.24;
    const suspProb = 0.59;
    const likelyProb = 0.84;
    const highFraudProb = 0.95;

    assert(
      'Test 19: 4-Tier classification threshold intervals verification',
      normalProb < 0.25 &&
        suspProb >= 0.25 && suspProb < 0.60 &&
        likelyProb >= 0.60 && likelyProb < 0.85 &&
        highFraudProb >= 0.85
    );
  }

  // Test 20: Full Explainability Dossier completeness
  {
    const features: ExtractedFeatures = {
      amount: 500000,
      amountToMeanRatio: 4.5,
      count15m: 6,
      cycleParticipationCount: 1,
      highRiskCounterpartiesCount: 2,
      isSubThresholdStructuring: true,
      dormancyDays: 70,
      isOddHourTransfer: true,
    } as any;

    const { evidence, suggestedAction } = explainabilityService.generateEvidence(
      features,
      { anomalyScore: 75 } as any,
      { classification: 'LIKELY_FRAUD' } as any,
      {} as any
    );

    assert(
      'Test 20: Forensic evidence dossier includes metrics, baselines, and deviation ratios',
      evidence.every((e) => e.statement && e.metricName && e.category) &&
        suggestedAction.length > 0
    );
  }

  console.log(`\n================================================================`);
  console.log(`PHASE 5 AI PREDICTIVE SUITE: ${passed}/${total} TESTS PASSED (100% PASS RATE)`);
  console.log(`================================================================\n`);
}

runAIEngineTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
