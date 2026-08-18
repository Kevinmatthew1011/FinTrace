import { NextResponse } from 'next/server';

export async function GET() {
  const info = {
    platform: 'FinTrace Financial Fraud Network Intelligence Platform',
    competition: 'Smart India Hackathon (SIH 2026)',
    version: '0.1.0-foundation',
    architecture: {
      frontend: 'Next.js 15 App Router (TypeScript, Vanilla CSS Design System)',
      backend: 'Next.js Edge/Node API Routes with Domain Layer',
      database: 'PostgreSQL 16 via Prisma ORM',
      containerization: 'Docker Compose (WSL 2 Compatible)',
    },
    modules: [
      { id: 'auth', name: 'Authentication & RBAC', status: 'SCAFFOLDED' },
      { id: 'ingestion', name: 'Transaction Ingestion Pipeline', status: 'SCAFFOLDED' },
      { id: 'entity-resolution', name: 'Entity Deduplication & Matching', status: 'SCAFFOLDED' },
      { id: 'graph', name: 'Graph Analysis & Cycle Detection', status: 'SCAFFOLDED' },
      { id: 'risk-engine', name: 'Risk Scoring & Anomaly Detection', status: 'SCAFFOLDED' },
      { id: 'xai', name: 'Explainable AI Reasoning Engine', status: 'SCAFFOLDED' },
      { id: 'alerts', name: 'Intelligent Alerting Dispatcher', status: 'SCAFFOLDED' },
      { id: 'cases', name: 'Investigator Case Management', status: 'SCAFFOLDED' },
      { id: 'admin', name: 'System Telemetry & Audit Logs', status: 'SCAFFOLDED' },
      { id: 'demo', name: 'Synthetic Fraud Data Generator', status: 'SCAFFOLDED' },
    ],
  };

  return NextResponse.json(info);
}
