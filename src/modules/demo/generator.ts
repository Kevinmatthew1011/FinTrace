import {
  EntityType,
  RiskLevel,
  TransactionChannel,
  TransactionStatus,
  AlertStatus,
  AlertType,
  CasePriority,
  CaseStatus,
  Role,
} from '@prisma/client';

export interface SeedDataset {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: Role;
    badgeNumber: string;
    department: string;
  }>;
  entities: Array<{
    id: string;
    name: string;
    entityType: EntityType;
    registrationNum?: string;
    taxIdentifier: string;
    jurisdiction: string;
    riskScore: number;
    riskLevel: RiskLevel;
    isSanctioned: boolean;
    isPEP: boolean;
    metadata?: Record<string, unknown>;
  }>;
  accounts: Array<{
    id: string;
    accountNumber: string;
    bankName: string;
    ifscOrRouting: string;
    accountType: string;
    currency: string;
    currentBalance: number;
    riskScore: number;
    isFrozen: boolean;
    isMuleFlagged: boolean;
    entityId: string;
  }>;
  transactions: Array<{
    id: string;
    referenceNumber: string;
    senderAccountId: string;
    receiverAccountId: string;
    amount: number;
    currency: string;
    channel: TransactionChannel;
    narrative: string;
    timestamp: Date;
    status: TransactionStatus;
    isSuspicious: boolean;
    riskScore: number;
    riskLevel: RiskLevel;
    flaggedRules: string[];
  }>;
  riskScores: Array<{
    id: string;
    entityId?: string;
    transactionId?: string;
    overallScore: number;
    riskLevel: RiskLevel;
    velocityScore: number;
    networkScore: number;
    anomalyScore: number;
    hopDistance: number;
    reasoning: Record<string, unknown>;
  }>;
  alerts: Array<{
    id: string;
    alertNumber: string;
    alertType: AlertType;
    title: string;
    description: string;
    severity: RiskLevel;
    status: AlertStatus;
    sourceEntityId?: string;
    targetEntityId?: string;
    aiExplanation: string;
    indicators: string[];
    caseId?: string;
    createdAt: Date;
  }>;
  cases: Array<{
    id: string;
    caseNumber: string;
    title: string;
    description: string;
    priority: CasePriority;
    status: CaseStatus;
    assignedToId?: string;
    findings?: string;
    tags: string[];
    createdAt: Date;
  }>;
}

export function generateSeedDataset(): SeedDataset {
  const users = [
    {
      id: 'usr-001',
      email: 'investigator.kiddo@fintrace.gov.in',
      name: 'Agent Kiddo',
      role: Role.INVESTIGATOR,
      badgeNumber: 'SIH-FT-001',
      department: 'Special Financial Crimes Wing',
    },
    {
      id: 'usr-002',
      email: 'lead.iyer@fintrace.gov.in',
      name: 'Investigator S. Iyer',
      role: Role.INVESTIGATOR,
      badgeNumber: 'SIH-FT-002',
      department: 'Anti-Money Laundering Directorate',
    },
    {
      id: 'usr-003',
      email: 'analyst.deshmukh@fintrace.gov.in',
      name: 'Analyst R. Deshmukh',
      role: Role.ANALYST,
      badgeNumber: 'SIH-FT-003',
      department: 'Intelligence & Pattern Triage',
    },
    {
      id: 'usr-004',
      email: 'admin@fintrace.gov.in',
      name: 'Platform Administrator',
      role: Role.ADMIN,
      badgeNumber: 'SIH-FT-ADM',
      department: 'System Operations',
    },
  ];

  const jurisdictions = [
    'Maharashtra (Mumbai)',
    'Delhi NCR',
    'Karnataka (Bengaluru)',
    'Gujarat (Surat/Ahmedabad)',
    'Tamil Nadu (Chennai)',
    'Telangana (Hyderabad)',
    'Kerala (Kochi)',
    'West Bengal (Kolkata)',
    'Rajasthan (Jaipur)',
    'Punjab (Ludhiana)',
  ];

  const banks = [
    { name: 'HDFC Bank', ifsc: 'HDFC0001245' },
    { name: 'ICICI Bank', ifsc: 'ICIC0004410' },
    { name: 'State Bank of India', ifsc: 'SBIN0001082' },
    { name: 'Axis Bank', ifsc: 'UTIB0007741' },
    { name: 'Kotak Mahindra Bank', ifsc: 'KKBK0003301' },
    { name: 'Punjab National Bank', ifsc: 'PUNB0006612' },
    { name: 'Bank of Baroda', ifsc: 'BARB0009981' },
    { name: 'Canara Bank', ifsc: 'CNRB0004011' },
    { name: 'IndusInd Bank', ifsc: 'INDB0008820' },
    { name: 'Yes Bank', ifsc: 'YESB0007719' },
  ];

  const entities: SeedDataset['entities'] = [];
  const accounts: SeedDataset['accounts'] = [];

  const primarySyndicate = [
    {
      id: 'ENT-8821',
      name: 'Apex Logistics Pvt Ltd',
      type: EntityType.SHELL_COMPANY,
      reg: 'U60200MH2021PTC369182',
      pan: 'AABCA8821K',
      jur: 'Maharashtra (Mumbai)',
      riskScore: 94,
      riskLevel: RiskLevel.CRITICAL,
      isSanctioned: false,
      isPEP: false,
    },
    {
      id: 'ENT-4109',
      name: 'Vikramaditya Traders',
      type: EntityType.MULE_AGGREGATOR,
      reg: 'U51909DL2022PTC401928',
      pan: 'BCDPV4109M',
      jur: 'Delhi NCR',
      riskScore: 91,
      riskLevel: RiskLevel.CRITICAL,
      isSanctioned: false,
      isPEP: false,
    },
    {
      id: 'ENT-3301',
      name: 'BlueHorizon Consulting',
      type: EntityType.SHELL_COMPANY,
      reg: 'U74140KA2020PTC281900',
      pan: 'AAECB3301P',
      jur: 'Karnataka (Bengaluru)',
      riskScore: 86,
      riskLevel: RiskLevel.CRITICAL,
      isSanctioned: false,
      isPEP: false,
    },
    {
      id: 'ENT-7731',
      name: 'Ramesh K. (Mule Node Alpha)',
      type: EntityType.INDIVIDUAL,
      reg: undefined,
      pan: 'BRRPK7731N',
      jur: 'Maharashtra (Thane)',
      riskScore: 89,
      riskLevel: RiskLevel.CRITICAL,
      isSanctioned: false,
      isPEP: false,
    },
    {
      id: 'ENT-2019',
      name: 'Zenith Global Merchants',
      type: EntityType.HIGH_RISK_MERCHANT,
      reg: 'U51100GJ2023PTC192841',
      pan: 'AAGCZ2019R',
      jur: 'Gujarat (Surat)',
      riskScore: 78,
      riskLevel: RiskLevel.HIGH,
      isSanctioned: false,
      isPEP: false,
    },
    {
      id: 'ENT-7719',
      name: 'Orbit FinTech Services',
      type: EntityType.BUSINESS,
      reg: 'U72900TG2019PTC132890',
      pan: 'AAFCO7719Q',
      jur: 'Telangana (Hyderabad)',
      riskScore: 68,
      riskLevel: RiskLevel.HIGH,
      isSanctioned: false,
      isPEP: false,
    },
  ];

  primarySyndicate.forEach((e) => {
    entities.push({
      id: e.id,
      name: e.name,
      entityType: e.type,
      registrationNum: e.reg,
      taxIdentifier: e.pan,
      jurisdiction: e.jur,
      riskScore: e.riskScore,
      riskLevel: e.riskLevel,
      isSanctioned: e.isSanctioned,
      isPEP: e.isPEP,
    });
  });

  const primaryAccounts = [
    { id: 'ACC-HDFC-9912', num: '50200049182910', bank: 'HDFC Bank', ifsc: 'HDFC0001245', type: 'CURRENT', bal: 4850000, risk: 92, mule: false, ent: 'ENT-8821' },
    { id: 'ACC-ICICI-4410', num: '001905018241', bank: 'ICICI Bank', ifsc: 'ICIC0004410', type: 'CURRENT', bal: 1820000, risk: 88, mule: false, ent: 'ENT-4109' },
    { id: 'ACC-KOTAK-3301', num: '991204819284', bank: 'Kotak Mahindra Bank', ifsc: 'KKBK0003301', type: 'CURRENT', bal: 3400000, risk: 86, mule: false, ent: 'ENT-3301' },
    { id: 'ACC-SBI-1082', num: '30918294819', bank: 'State Bank of India', ifsc: 'SBIN0001082', type: 'SAVINGS', bal: 420000, risk: 89, mule: true, ent: 'ENT-7731' },
    { id: 'ACC-SBI-9901', num: '40192849182', bank: 'State Bank of India', ifsc: 'SBIN0009901', type: 'CURRENT', bal: 2900000, risk: 78, mule: false, ent: 'ENT-2019' },
    { id: 'ACC-YES-7719', num: '008918274819', bank: 'Yes Bank', ifsc: 'YESB0007719', type: 'CURRENT', bal: 5400000, risk: 68, mule: false, ent: 'ENT-7719' },
  ];

  primaryAccounts.forEach((acc) => {
    accounts.push({
      id: acc.id,
      accountNumber: acc.num,
      bankName: acc.bank,
      ifscOrRouting: acc.ifsc,
      accountType: acc.type,
      currency: 'INR',
      currentBalance: acc.bal,
      riskScore: acc.risk,
      isFrozen: acc.mule,
      isMuleFlagged: acc.mule,
      entityId: acc.ent,
    });
  });

  const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunil', 'Kavita', 'Rohan', 'Sneha', 'Vikram', 'Ananya', 'Deepak', 'Meera', 'Arjun', 'Pooja', 'Suresh', 'Manish', 'Neha', 'Alok', 'Ritu', 'Gaurav', 'Swati'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Gupta', 'Iyer', 'Reddy', 'Nair', 'Deshmukh', 'Mehta', 'Joshi', 'Bose', 'Chopra', 'Malhotra', 'Agarwal', 'Singh', 'Kaur', 'Rao', 'Sundaram', 'Mishra', 'Pandey'];
  const companyPrefixes = ['Apex', 'Horizon', 'Zenith', 'Kaveri', 'Surya', 'Southern', 'Northern', 'Western', 'Eastern', 'Paramount', 'Vanguard', 'Matrix', 'Titan', 'Sterling', 'Nexus', 'Galaxy', 'Prime', 'Trident', 'Vertex', 'Falcon'];
  const companySuffixes = ['Enterprises', 'Logistics', 'Industries', 'Trading Co', 'Exports', 'Holdings', 'Ventures', 'Infotech', 'Solutions', 'Agro Products', 'Textiles', 'Engineering', 'Financials', 'Merchants'];

  let entityCounter = 100;
  let accountCounter = 100;

  for (let i = 1; i <= 115; i++) {
    entityCounter++;
    const isCorp = i % 3 !== 0;
    const isHighRisk = i <= 20;
    const isMule = i > 20 && i <= 35;

    let entityType: EntityType;
    let name: string;

    if (isMule) {
      entityType = EntityType.INDIVIDUAL;
      name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]} (Mule Node ${i - 20})`;
    } else if (isCorp) {
      entityType = isHighRisk ? EntityType.SHELL_COMPANY : (i % 5 === 0 ? EntityType.MERCHANT : EntityType.BUSINESS);
      name = `${companyPrefixes[i % companyPrefixes.length]} ${companySuffixes[(i * 2) % companySuffixes.length]} ${isCorp ? 'Pvt Ltd' : ''}`;
    } else {
      entityType = EntityType.INDIVIDUAL;
      name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 7) % lastNames.length]}`;
    }

    const riskScore = isHighRisk
      ? Math.floor(75 + (i % 24))
      : isMule
      ? Math.floor(65 + (i % 25))
      : Math.floor(10 + (i % 45));

    const riskLevel =
      riskScore >= 80 ? RiskLevel.CRITICAL : riskScore >= 60 ? RiskLevel.HIGH : riskScore >= 30 ? RiskLevel.MEDIUM : RiskLevel.LOW;

    const panChar3 = isCorp ? 'C' : 'P';
    const pan = `AA${panChar3}${String.fromCharCode(65 + (i % 26))}${String(1000 + i).slice(-4)}${String.fromCharCode(65 + ((i * 3) % 26))}`;
    const entId = `ENT-${entityCounter}`;

    entities.push({
      id: entId,
      name,
      entityType,
      registrationNum: isCorp ? `U${10000 + i}${jurisdictions[i % jurisdictions.length].slice(0, 2).toUpperCase()}202${i % 4}PTC${100000 + i}` : undefined,
      taxIdentifier: pan,
      jurisdiction: jurisdictions[i % jurisdictions.length],
      riskScore,
      riskLevel,
      isSanctioned: isHighRisk && i % 4 === 0,
      isPEP: !isCorp && i % 15 === 0,
    });

    const numAccounts = isHighRisk || isCorp ? (i % 2 === 0 ? 2 : 1) : 1;
    for (let a = 0; a < numAccounts; a++) {
      accountCounter++;
      const bank = banks[(i + a) % banks.length];
      const accId = `ACC-${bank.name.split(' ')[0].toUpperCase()}-${accountCounter}`;

      accounts.push({
        id: accId,
        accountNumber: `${bank.ifsc.slice(0, 4)}${1000000000 + accountCounter}`,
        bankName: bank.name,
        ifscOrRouting: bank.ifsc,
        accountType: isCorp ? 'CURRENT' : 'SAVINGS',
        currency: 'INR',
        currentBalance: Math.floor(25000 + (i * 45000)),
        riskScore: riskScore,
        isFrozen: isMule && i % 3 === 0,
        isMuleFlagged: isMule,
        entityId: entId,
      });
    }
  }

  const transactions: SeedDataset['transactions'] = [];
  const riskScores: SeedDataset['riskScores'] = [];
  const alerts: SeedDataset['alerts'] = [];
  const cases: SeedDataset['cases'] = [];

  let txCounter = 1000;
  const now = new Date('2026-08-18T16:00:00Z');

  function getDateAgo(daysAgo: number, hourOffset = 0, minuteOffset = 0) {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(d.getHours() - hourOffset, d.getMinutes() - minuteOffset);
    return d;
  }

  // FRAUD PATTERN 1: Rapid Mule Dispersal
  const muleAccounts = accounts.filter((a) => a.isMuleFlagged);
  for (let i = 0; i < 20; i++) {
    txCounter++;
    const sender = 'ACC-ICICI-4410';
    const receiver = muleAccounts[i % muleAccounts.length]?.id || 'ACC-SBI-1082';
    const amt = Math.floor(210000 + (i * 3500));
    const txId = `TXN-MULE-${txCounter}`;

    const txDate = getDateAgo(0, 1, i * 4);

    transactions.push({
      id: txId,
      referenceNumber: `TXN-2026-${txCounter}`,
      senderAccountId: sender,
      receiverAccountId: receiver,
      amount: amt,
      currency: 'INR',
      channel: TransactionChannel.IMPS,
      narrative: `Consulting settlement tranche #${i + 1}`,
      timestamp: txDate,
      status: TransactionStatus.FLAGGED,
      isSuspicious: true,
      riskScore: 88,
      riskLevel: RiskLevel.CRITICAL,
      flaggedRules: ['Rapid Dispersal Flow', 'Mule Account Characteristic'],
    });

    riskScores.push({
      id: `RS-${txCounter}`,
      entityId: 'ENT-4109',
      transactionId: txId,
      overallScore: 88,
      riskLevel: RiskLevel.CRITICAL,
      velocityScore: 94,
      networkScore: 86,
      anomalyScore: 84,
      hopDistance: 2,
      reasoning: {
        pattern: 'RAPID_DISPERSAL',
        explanation: 'Funds dispersed to newly activated mule tier within 4 minutes of large receipt',
      },
    });
  }

  // FRAUD PATTERN 2: Circular Carousel Loops
  const loopNodes = ['ACC-HDFC-9912', 'ACC-ICICI-4410', 'ACC-KOTAK-3301', 'ACC-HDFC-9912'];
  for (let l = 0; l < 4; l++) {
    for (let step = 0; step < 3; step++) {
      txCounter++;
      const s = loopNodes[step];
      const r = loopNodes[step + 1];
      const amt = Math.floor(1180000 - (step * 8000));
      const txId = `TXN-CIRC-${txCounter}`;

      const txDate = getDateAgo(l * 3, 2, step * 25);

      transactions.push({
        id: txId,
        referenceNumber: `TXN-2026-${txCounter}`,
        senderAccountId: s,
        receiverAccountId: r,
        amount: amt,
        currency: 'INR',
        channel: TransactionChannel.RTGS,
        narrative: `Intercompany adjustment cycle ${l + 1} leg ${step + 1}`,
        timestamp: txDate,
        status: step === 2 ? TransactionStatus.BLOCKED : TransactionStatus.FLAGGED,
        isSuspicious: true,
        riskScore: 94,
        riskLevel: RiskLevel.CRITICAL,
        flaggedRules: ['Circular Flow Closing Leg', 'Layering Round-Trip'],
      });
    }
  }

  // FRAUD PATTERN 3: Sub-₹50k Structuring
  for (let i = 0; i < 35; i++) {
    txCounter++;
    const sender = accounts[30 + (i % 20)].id;
    const receiver = 'ACC-SBI-9901';
    const amt = 48000 + ((i * 53) % 1900);
    const txId = `TXN-STRUC-${txCounter}`;

    const txDate = getDateAgo(i % 5, (i % 8) + 1, (i * 7) % 60);

    transactions.push({
      id: txId,
      referenceNumber: `TXN-2026-${txCounter}`,
      senderAccountId: sender,
      receiverAccountId: receiver,
      amount: amt,
      currency: 'INR',
      channel: TransactionChannel.UPI,
      narrative: `Micro payment order #${4400 + i}`,
      timestamp: txDate,
      status: TransactionStatus.FLAGGED,
      isSuspicious: true,
      riskScore: 76,
      riskLevel: RiskLevel.HIGH,
      flaggedRules: ['Sub-50k Structuring', 'Repeated Beneficiary'],
    });
  }

  // GENERAL & BACKGROUND TRANSACTIONS (500+ more txns)
  const channels = [TransactionChannel.UPI, TransactionChannel.IMPS, TransactionChannel.NEFT, TransactionChannel.RTGS];
  const statuses = [TransactionStatus.COMPLETED, TransactionStatus.COMPLETED, TransactionStatus.COMPLETED, TransactionStatus.COMPLETED, TransactionStatus.UNDER_REVIEW];

  for (let i = 1; i <= 500; i++) {
    txCounter++;
    const senderAcc = accounts[i % accounts.length];
    const receiverAcc = accounts[(i * 7 + 13) % accounts.length];
    if (senderAcc.id === receiverAcc.id) continue;

    const daysAgo = (i % 30);
    const hour = (i * 3) % 24;
    const minute = (i * 11) % 60;
    const txDate = getDateAgo(daysAgo, hour, minute);

    const isHigh = senderAcc.riskScore >= 60 || receiverAcc.riskScore >= 60;
    const channel = channels[i % channels.length];
    const amount = channel === TransactionChannel.RTGS
      ? Math.floor(250000 + (i * 8500))
      : channel === TransactionChannel.UPI
      ? Math.floor(500 + (i * 320))
      : Math.floor(15000 + (i * 1400));

    const status = isHigh ? (i % 3 === 0 ? TransactionStatus.FLAGGED : TransactionStatus.UNDER_REVIEW) : statuses[i % statuses.length];
    const riskScore = isHigh ? Math.floor(60 + (i % 35)) : Math.floor(5 + (i % 25));
    const riskLevel = riskScore >= 80 ? RiskLevel.CRITICAL : riskScore >= 60 ? RiskLevel.HIGH : riskScore >= 30 ? RiskLevel.MEDIUM : RiskLevel.LOW;
    const isSuspicious = riskScore >= 60;

    const txId = `TXN-GEN-${txCounter}`;

    transactions.push({
      id: txId,
      referenceNumber: `TXN-2026-${txCounter}`,
      senderAccountId: senderAcc.id,
      receiverAccountId: receiverAcc.id,
      amount,
      currency: 'INR',
      channel,
      narrative: isSuspicious ? `Unusual velocity payment ref #${txCounter}` : `Commercial invoice #${txCounter}`,
      timestamp: txDate,
      status,
      isSuspicious,
      riskScore,
      riskLevel,
      flaggedRules: isSuspicious ? ['Automated Anomaly Detector', 'Counterparty Score Threshold'] : [],
    });
  }

  // FRAUD ALERTS (36 alerts)
  const alertTypes = [
    { type: AlertType.CIRCULAR_ROUTING, title: 'Circular Fund Movement Loop Detected', sev: RiskLevel.CRITICAL, ent: 'ENT-8821' },
    { type: AlertType.RAPID_VELOCITY, title: 'Rapid Transaction Velocity Dispersal', sev: RiskLevel.CRITICAL, ent: 'ENT-4109' },
    { type: AlertType.STRUCTURING, title: 'Multi-Account Sub-₹50k Structuring Pattern', sev: RiskLevel.HIGH, ent: 'ENT-2019' },
    { type: AlertType.MULE_NETWORK, title: 'Direct Flow into Unregulated Offshore Crypto Desk', sev: RiskLevel.CRITICAL, ent: 'ENT-7731' },
    { type: AlertType.DORMANT_SPIKE, title: 'Dormant Corporate Account Sudden Spike', sev: RiskLevel.HIGH, ent: 'ENT-3301' },
    { type: AlertType.HIGH_RISK_INTERACTION, title: 'High-Risk Counterparty Adjacency Detected', sev: RiskLevel.MEDIUM, ent: 'ENT-7719' },
  ];

  for (let i = 0; i < 36; i++) {
    const base = alertTypes[i % alertTypes.length];
    const alertId = `alt-${1000 + i}`;
    const alertNumber = `ALT-2026-${1000 + i}`;
    const targetEntityId = entities[i % entities.length].id;
    const sev = i % 3 === 0 ? RiskLevel.CRITICAL : i % 2 === 0 ? RiskLevel.HIGH : RiskLevel.MEDIUM;
    const status = i % 4 === 0 ? AlertStatus.NEW : i % 3 === 0 ? AlertStatus.INVESTIGATING : AlertStatus.RESOLVED;

    alerts.push({
      id: alertId,
      alertNumber,
      alertType: base.type,
      title: `${base.title} #${i + 1}`,
      description: `Automated detection trigger on ${base.ent}: anomalous volume pattern violating AML velocity rule #${i + 1}.`,
      severity: sev,
      status,
      sourceEntityId: base.ent,
      targetEntityId,
      aiExplanation: 'Behavioral topology confirms high-frequency micro routing with near-zero retention latency.',
      indicators: [
        'Anomalous counterparty network density',
        'Velocity deviation > 480% over 7-day baseline',
        'Structuring beneath statutory threshold',
      ],
      createdAt: getDateAgo(i % 10, i % 6, (i * 14) % 60),
    });
  }

  // INVESTIGATION CASES (18 cases)
  const caseTemplates = [
    { title: 'Syndicate Layering & Mule Ring Alpha', pri: CasePriority.URGENT, stat: CaseStatus.UNDER_REVIEW, usr: 'usr-001' },
    { title: 'Circular Fund Movement & Carousel GST Fraud', pri: CasePriority.HIGH, stat: CaseStatus.OPEN, usr: 'usr-002' },
    { title: 'Structuring & High-Velocity Micro-Payments Ring', pri: CasePriority.HIGH, stat: CaseStatus.UNDER_REVIEW, usr: 'usr-003' },
    { title: 'Suspicious High-Risk Merchant Hub', pri: CasePriority.MEDIUM, stat: CaseStatus.EVIDENCE_SUBMITTED, usr: 'usr-002' },
    { title: 'Dormant Corporate Takeover Syndicate', pri: CasePriority.URGENT, stat: CaseStatus.CLOSED, usr: 'usr-001' },
    { title: 'Hawala Channel Routing & Offshore Settlement', pri: CasePriority.CRITICAL, stat: CaseStatus.IN_REVIEW, usr: 'usr-001' },
    { title: 'Synthetic Identity PAN Farming Syndicate', pri: CasePriority.HIGH, stat: CaseStatus.OPEN, usr: 'usr-003' },
    { title: 'P2P Crypto Cash-Out Aggregator Desk', pri: CasePriority.CRITICAL, stat: CaseStatus.UNDER_REVIEW, usr: 'usr-002' },
  ];

  for (let i = 0; i < 18; i++) {
    const tmpl = caseTemplates[i % caseTemplates.length];
    const caseId = `case-${100 + i}`;
    const caseNum = `CASE-2026-${1000 + i}`;

    cases.push({
      id: caseId,
      caseNumber: caseNum,
      title: `${tmpl.title} (Batch ${i + 1})`,
      description: `Comprehensive forensic dossier analyzing suspicious fund flows across inter-state banking clusters.`,
      priority: tmpl.pri,
      status: tmpl.stat,
      assignedToId: tmpl.usr,
      findings: 'Forensic transaction path traces multiple layered hops consolidating at flagged cash-out nodes.',
      tags: ['Layering', 'Smurfing', 'Shell Company', 'Mule Network'],
      createdAt: getDateAgo(i % 14, i % 5, (i * 9) % 60),
    });
  }

  return {
    users,
    entities,
    accounts,
    transactions,
    riskScores,
    alerts,
    cases,
  };
}
