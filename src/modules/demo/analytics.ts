import {
  DashboardKPISummary,
  ActivityTimePoint,
  RiskDistributionTier,
  RegionalActivity,
} from '@/types/fraud';

export const DEMO_KPI_SUMMARY: DashboardKPISummary = {
  totalTransactions: {
    count: 1247892,
    formatted: '12,47,892',
    changePercentage: 8.4,
    periodComparison: '+8.4% vs previous 30 days',
  },
  suspiciousTransactions: {
    count: 3842,
    formatted: '3,842',
    changePercentage: 14.2,
    periodComparison: '+14.2% vs previous 30 days',
    percentageOfTotal: 0.31,
  },
  activeAlerts: {
    count: 156,
    criticalCount: 18,
    highCount: 64,
    mediumCount: 52,
    lowCount: 22,
    changePercentage: -4.1,
  },
  highRiskEntities: {
    count: 287,
    formatted: '287',
    changePercentage: 6.1,
    periodComparison: '+6.1% new entities flagged',
  },
  investigationsSummary: {
    openCount: 24,
    underReviewCount: 12,
    criticalCount: 7,
    recentlyClosedCount: 18,
  },
};

export const DEMO_ACTIVITY_24H: ActivityTimePoint[] = [
  { timeLabel: '00:00', timestamp: '2026-08-18T00:00:00Z', totalVolume: 18200, suspiciousVolume: 42, totalAmountRupees: 14200000 },
  { timeLabel: '03:00', timestamp: '2026-08-18T03:00:00Z', totalVolume: 9400, suspiciousVolume: 78, totalAmountRupees: 8900000 },
  { timeLabel: '06:00', timestamp: '2026-08-18T06:00:00Z', totalVolume: 24100, suspiciousVolume: 51, totalAmountRupees: 21500000 },
  { timeLabel: '09:00', timestamp: '2026-08-18T09:00:00Z', totalVolume: 89400, suspiciousVolume: 210, totalAmountRupees: 94200000 },
  { timeLabel: '12:00', timestamp: '2026-08-18T12:00:00Z', totalVolume: 112000, suspiciousVolume: 380, totalAmountRupees: 124000000 },
  { timeLabel: '15:00', timestamp: '2026-08-18T15:00:00Z', totalVolume: 145000, suspiciousVolume: 490, totalAmountRupees: 168000000 },
  { timeLabel: '18:00', timestamp: '2026-08-18T18:00:00Z', totalVolume: 98000, suspiciousVolume: 290, totalAmountRupees: 112000000 },
  { timeLabel: '21:00', timestamp: '2026-08-18T21:00:00Z', totalVolume: 54000, suspiciousVolume: 140, totalAmountRupees: 58000000 },
];

export const DEMO_ACTIVITY_7D: ActivityTimePoint[] = [
  { timeLabel: 'Aug 12', timestamp: '2026-08-12T00:00:00Z', totalVolume: 164000, suspiciousVolume: 480, totalAmountRupees: 184000000 },
  { timeLabel: 'Aug 13', timestamp: '2026-08-13T00:00:00Z', totalVolume: 172000, suspiciousVolume: 510, totalAmountRupees: 196000000 },
  { timeLabel: 'Aug 14', timestamp: '2026-08-14T00:00:00Z', totalVolume: 189000, suspiciousVolume: 640, totalAmountRupees: 214000000 },
  { timeLabel: 'Aug 15', timestamp: '2026-08-15T00:00:00Z', totalVolume: 124000, suspiciousVolume: 320, totalAmountRupees: 132000000 },
  { timeLabel: 'Aug 16', timestamp: '2026-08-16T00:00:00Z', totalVolume: 131000, suspiciousVolume: 390, totalAmountRupees: 145000000 },
  { timeLabel: 'Aug 17', timestamp: '2026-08-17T00:00:00Z', totalVolume: 198000, suspiciousVolume: 710, totalAmountRupees: 238000000 },
  { timeLabel: 'Aug 18', timestamp: '2026-08-18T00:00:00Z', totalVolume: 210000, suspiciousVolume: 780, totalAmountRupees: 254000000 },
];

export const DEMO_ACTIVITY_30D: ActivityTimePoint[] = [
  { timeLabel: 'Week 1', timestamp: '2026-07-20T00:00:00Z', totalVolume: 1120000, suspiciousVolume: 3100, totalAmountRupees: 1240000000 },
  { timeLabel: 'Week 2', timestamp: '2026-07-27T00:00:00Z', totalVolume: 1280000, suspiciousVolume: 3650, totalAmountRupees: 1480000000 },
  { timeLabel: 'Week 3', timestamp: '2026-08-03T00:00:00Z', totalVolume: 1190000, suspiciousVolume: 3420, totalAmountRupees: 1350000000 },
  { timeLabel: 'Week 4', timestamp: '2026-08-10T00:00:00Z', totalVolume: 1420000, suspiciousVolume: 4200, totalAmountRupees: 1680000000 },
];

export const DEMO_RISK_DISTRIBUTION: RiskDistributionTier[] = [
  {
    level: 'LOW',
    label: 'Low Risk (0–29)',
    count: 1103136,
    percentage: 88.4,
    volumeRupees: 8940000000,
  },
  {
    level: 'MEDIUM',
    label: 'Medium Risk (30–59)',
    count: 106070,
    percentage: 8.5,
    volumeRupees: 1240000000,
  },
  {
    level: 'HIGH',
    label: 'High Risk (60–79)',
    count: 34941,
    percentage: 2.8,
    volumeRupees: 480000000,
  },
  {
    level: 'CRITICAL',
    label: 'Critical Risk (80–100)',
    count: 3745,
    percentage: 0.3,
    volumeRupees: 182000000,
  },
];

export const DEMO_REGIONAL_ACTIVITY: RegionalActivity[] = [
  { region: 'Maharashtra (Mumbai/Pune)', transactionCount: 399325, volumeRupees: 4200000000, percentage: 32.0, riskLevel: 'HIGH' },
  { region: 'Delhi NCR', transactionCount: 262057, volumeRupees: 2800000000, percentage: 21.0, riskLevel: 'HIGH' },
  { region: 'Karnataka (Bengaluru)', transactionCount: 199662, volumeRupees: 2100000000, percentage: 16.0, riskLevel: 'MEDIUM' },
  { region: 'Gujarat (Surat/Ahmedabad)', transactionCount: 149747, volumeRupees: 1600000000, percentage: 12.0, riskLevel: 'HIGH' },
  { region: 'Tamil Nadu (Chennai)', transactionCount: 112310, volumeRupees: 1200000000, percentage: 9.0, riskLevel: 'LOW' },
  { region: 'Telangana (Hyderabad)', transactionCount: 74873, volumeRupees: 800000000, percentage: 6.0, riskLevel: 'MEDIUM' },
  { region: 'Kerala', transactionCount: 49915, volumeRupees: 500000000, percentage: 4.0, riskLevel: 'LOW' },
];
