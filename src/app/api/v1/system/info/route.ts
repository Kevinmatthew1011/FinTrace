import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      entityCount,
      accountCount,
      txCount,
      alertCount,
      caseCount,
      auditCount,
    ] = await Promise.all([
      prisma.entity.count(),
      prisma.account.count(),
      prisma.transaction.count(),
      prisma.fraudAlert.count(),
      prisma.case.count(),
      prisma.auditLog.count(),
    ]);

    const info = {
      platform: 'FinTrace Financial Fraud Network Intelligence Platform',
      competition: 'Smart India Hackathon (SIH 2026)',
      version: '1.0.0-sih-prototype',
      environment: 'PostgreSQL 16 Engine (Prisma ORM)',
      architecture: {
        frontend: 'Next.js 15 App Router (TypeScript, Responsive Design System)',
        backend: 'Next.js API Routes (Domain Services Architecture)',
        database: 'PostgreSQL 16 (Relational & Graph Adjacency Store)',
        security: 'Append-Only Audit Trails & Parameterized ORM Protection',
      },
      counts: {
        entities: entityCount,
        accounts: accountCount,
        transactions: txCount,
        alerts: alertCount,
        cases: caseCount,
        auditLogs: auditCount,
      },
      modules: [
        { id: 'database', name: 'PostgreSQL 16 Relational Engine', status: 'ACTIVE', phase: 'Phase 2' },
        { id: 'graph', name: 'Fraud Network & Multi-Hop Cycle Intelligence', status: 'ACTIVE', phase: 'Phase 3' },
        { id: 'risk-engine', name: 'Deterministic Multi-Factor Risk Engine', status: 'ACTIVE', phase: 'Phase 4' },
        { id: 'alerts', name: 'Fraud Alert Generation & Prioritization', status: 'ACTIVE', phase: 'Phase 5' },
        { id: 'cases', name: 'Investigation Dossier & Case Management', status: 'ACTIVE', phase: 'Phase 6' },
        { id: 'intelligence', name: 'Explainable Intelligence & Baseline Reasoner', status: 'ACTIVE', phase: 'Phase 7' },
        { id: 'assistant', name: 'Generative AI Investigation Assistant', status: 'COMING_SOON', phase: 'Planned' },
      ],
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: info,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Database connection failed' },
      },
      { status: 500 }
    );
  }
}
