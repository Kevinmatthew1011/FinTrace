import { RiskLevel } from '@prisma/client';

export const RISK_ENGINE_VERSION = 'risk-engine-v1';

export const RISK_THRESHOLDS = {
  LOW_MAX: 29,
  MEDIUM_MAX: 59,
  HIGH_MAX: 79,
  CRITICAL_MIN: 80,
} as const;

export function getRiskLevelFromScore(score: number): RiskLevel {
  const normalized = normalizeRiskScore(score);
  if (normalized >= RISK_THRESHOLDS.CRITICAL_MIN) return 'CRITICAL';
  if (normalized > RISK_THRESHOLDS.MEDIUM_MAX) return 'HIGH';
  if (normalized > RISK_THRESHOLDS.LOW_MAX) return 'MEDIUM';
  return 'LOW';
}

export function normalizeRiskScore(score: number): number {
  if (isNaN(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

// Configurable weights per subject type
export const TRANSACTION_RISK_WEIGHTS = {
  AMOUNT_ANOMALY: 15,
  VELOCITY: 20,
  BEHAVIOR: 15,
  COUNTERPARTY: 15,
  PATTERN_STRUCTURING: 15,
  NETWORK_TOPOLOGY: 20,
} as const;

export const ENTITY_RISK_WEIGHTS = {
  NETWORK_TOPOLOGY: 25,
  VELOCITY_VOLUME: 20,
  COUNTERPARTY_CONCENTRATION: 20,
  ALERT_HISTORY: 20,
  STRUCTURING_BEHAVIOR: 15,
} as const;

export const ACCOUNT_RISK_WEIGHTS = {
  VELOCITY: 25,
  FLOW_IMBALANCE: 20,
  COUNTERPARTY_EXPOSURE: 20,
  STRUCTURING_ANOMALY: 20,
  DORMANCY_TAKEOVER: 15,
} as const;

export const STRUCTURING_CONFIG = {
  LOWER_BOUND_INR: 45000,
  UPPER_BOUND_INR: 49999,
  WINDOW_HOURS: 48,
  MIN_BURST_COUNT: 3,
} as const;

export const DORMANCY_CONFIG = {
  INACTIVITY_DAYS_THRESHOLD: 30,
  SURGE_MIN_AMOUNT_INR: 200000,
  SURGE_WINDOW_HOURS: 72,
} as const;
