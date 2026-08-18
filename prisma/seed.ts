import { PrismaClient, Prisma } from '@prisma/client';
import { generateSeedDataset } from '../src/modules/demo/generator';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting FinTrace deterministic database seeding...');

  // 1. Clean existing records in correct foreign key order
  console.log('[Seed] Cleaning existing records...');
  await prisma.auditLog.deleteMany({});
  await prisma.riskScore.deleteMany({});
  await prisma.fraudAlert.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.case.deleteMany({});
  await prisma.entity.deleteMany({});
  await prisma.user.deleteMany({});

  const dataset = generateSeedDataset();

  // 2. Seed Users
  console.log(`[Seed] Seeding ${dataset.users.length} users...`);
  for (const user of dataset.users) {
    await prisma.user.create({
      data: user,
    });
  }

  // 3. Seed Cases
  console.log(`[Seed] Seeding ${dataset.cases.length} investigation cases...`);
  for (const c of dataset.cases) {
    await prisma.case.create({
      data: {
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        description: c.description,
        priority: c.priority,
        status: c.status,
        assignedToId: c.assignedToId,
        findings: c.findings,
        tags: c.tags,
        createdAt: c.createdAt,
      },
    });
  }

  // 4. Seed Entities
  console.log(`[Seed] Seeding ${dataset.entities.length} entities...`);
  for (const entity of dataset.entities) {
    await prisma.entity.create({
      data: {
        id: entity.id,
        name: entity.name,
        entityType: entity.entityType,
        registrationNum: entity.registrationNum,
        taxIdentifier: entity.taxIdentifier,
        jurisdiction: entity.jurisdiction,
        riskScore: entity.riskScore,
        riskLevel: entity.riskLevel,
        isSanctioned: entity.isSanctioned,
        isPEP: entity.isPEP,
      },
    });
  }

  // 5. Seed Accounts
  console.log(`[Seed] Seeding ${dataset.accounts.length} accounts...`);
  for (const acc of dataset.accounts) {
    await prisma.account.create({
      data: {
        id: acc.id,
        accountNumber: acc.accountNumber,
        bankName: acc.bankName,
        ifscOrRouting: acc.ifscOrRouting,
        accountType: acc.accountType,
        currency: acc.currency,
        currentBalance: new Prisma.Decimal(acc.currentBalance),
        riskScore: acc.riskScore,
        isFrozen: acc.isFrozen,
        isMuleFlagged: acc.isMuleFlagged,
        entityId: acc.entityId,
      },
    });
  }

  // 6. Seed Transactions
  console.log(`[Seed] Seeding ${dataset.transactions.length} transactions...`);
  for (const tx of dataset.transactions) {
    await prisma.transaction.create({
      data: {
        id: tx.id,
        referenceNumber: tx.referenceNumber,
        senderAccountId: tx.senderAccountId,
        receiverAccountId: tx.receiverAccountId,
        amount: new Prisma.Decimal(tx.amount),
        currency: tx.currency,
        channel: tx.channel,
        narrative: tx.narrative,
        timestamp: tx.timestamp,
        status: tx.status,
        isSuspicious: tx.isSuspicious,
        riskScore: tx.riskScore,
        riskLevel: tx.riskLevel,
        flaggedRules: tx.flaggedRules,
      },
    });
  }

  // 7. Seed Risk Scores
  console.log(`[Seed] Seeding ${dataset.riskScores.length} risk scores...`);
  for (const rs of dataset.riskScores) {
    await prisma.riskScore.create({
      data: {
        id: rs.id,
        entityId: rs.entityId,
        transactionId: rs.transactionId,
        overallScore: rs.overallScore,
        riskLevel: rs.riskLevel,
        velocityScore: rs.velocityScore,
        networkScore: rs.networkScore,
        anomalyScore: rs.anomalyScore,
        hopDistance: rs.hopDistance,
        reasoning: rs.reasoning as Prisma.InputJsonValue,
      },
    });
  }

  // 8. Seed Alerts
  console.log(`[Seed] Seeding ${dataset.alerts.length} fraud alerts...`);
  for (const alert of dataset.alerts) {
    await prisma.fraudAlert.create({
      data: {
        id: alert.id,
        alertNumber: alert.alertNumber,
        alertType: alert.alertType,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        status: alert.status,
        sourceEntityId: alert.sourceEntityId,
        targetEntityId: alert.targetEntityId,
        aiExplanation: alert.aiExplanation,
        indicators: alert.indicators as Prisma.InputJsonValue,
        createdAt: alert.createdAt,
      },
    });
  }

  // Final count verification
  const userCount = await prisma.user.count();
  const entityCount = await prisma.entity.count();
  const accountCount = await prisma.account.count();
  const txCount = await prisma.transaction.count();
  const alertCount = await prisma.fraudAlert.count();
  const caseCount = await prisma.case.count();
  const riskScoreCount = await prisma.riskScore.count();

  console.log('\n========================================');
  console.log('SEEDING COMPLETED SUCCESSFULLY:');
  console.log(`- Users:        ${userCount}`);
  console.log(`- Entities:     ${entityCount}`);
  console.log(`- Accounts:     ${accountCount}`);
  console.log(`- Transactions: ${txCount}`);
  console.log(`- Alerts:       ${alertCount}`);
  console.log(`- Cases:        ${caseCount}`);
  console.log(`- Risk Scores:  ${riskScoreCount}`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
