# FinTrace: AI-Powered Financial Fraud Network Intelligence Platform

> **Prototype Submission for Smart India Hackathon (SIH 2026)**  
> An AI-driven investigation platform to uncover financial fraud networks, detect cyclic transactions & money mule rings, calculate multi-factor risk scores, and provide Explainable AI (XAI) insights for financial crime analysts.

---

## 📌 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Prerequisites & WSL 2 Setup](#prerequisites--wsl-2-setup)
5. [Quick Start Guide (WSL / Ubuntu)](#quick-start-guide-wsl--ubuntu)
6. [Database Management & Docker](#database-management--docker)
7. [Environment Variables](#environment-variables)
8. [Module Architecture & Roadmap](#module-architecture--roadmap)
9. [Available Scripts](#available-scripts)

---

## 🌟 Overview

FinTrace is engineered to solve modern financial crime challenges:
- **Transaction Ingestion & Normalization**: High-speed processing of structured transaction datasets (NEFT/IMPS/UPI/SWIFT/Crypto).
- **Entity Resolution**: Intelligent identity matching and deduplication across accounts, tax identifiers, and phone records.
- **Graph Network Intelligence**: Topological graph analysis uncovering money mule clusters, layering pipelines, and closed transaction loops.
- **Multi-Factor Risk Scoring**: Real-time composite scoring combining velocity factors, threshold anomalies, and network centrality.
- **Explainable AI (XAI)**: Generates transparent, human-readable rationales explaining **WHY** an entity or network is deemed suspicious.
- **Investigator Case Management**: Audit-ready case workflows, evidence timelines, and dossier generation.

---

## 🏗️ Architecture

```
FinTrace/
├── docker-compose.yml           # PostgreSQL 16 database orchestration
├── prisma/
│   ├── schema.prisma           # Relational schema (Entities, Transactions, Alerts, Cases)
│   └── seed.ts                 # Database seeder & connection verifier
├── src/
│   ├── app/                    # Next.js App Router (UI Pages & API Routes)
│   │   ├── api/
│   │   │   ├── health/         # System health & DB connection probe
│   │   │   └── v1/system/info/ # Architecture metadata endpoint
│   │   ├── globals.css         # Dark-mode design system
│   │   ├── layout.tsx          # Root shell layout (Header, Sidebar)
│   │   └── page.tsx            # Foundation dashboard
│   ├── components/
│   │   └── common/             # Reusable UI components (Header, Sidebar, Badges, Cards)
│   ├── lib/                    # Shared core infrastructure
│   │   ├── env.ts              # Type-safe environment validation (Zod)
│   │   ├── errors.ts           # Centralized AppError hierarchy & API error formatter
│   │   ├── logger.ts           # Leveled logging system with timestamping & metadata
│   │   └── prisma.ts           # PrismaClient singleton with health checking
│   └── modules/                # Decoupled domain service modules
│       ├── admin/              # Telemetry, audit logs, and metrics
│       ├── alerts/             # Fraud alert generation & triage
│       ├── auth/               # RBAC & session validation
│       ├── cases/              # Case dossiers & evidence management
│       ├── demo/               # Synthetic fraud scenario datasets
│       ├── entity-resolution/  # Fuzzy matching & entity linking
│       ├── graph/              # Network graph analysis & cycle detection
│       ├── ingestion/          # Transaction ingestion & schema validation
│       ├── risk-engine/        # Multi-factor risk calculation
│       └── xai/                # Explainable AI reasoning engine
├── .env.example                # Documented configuration template
├── .gitignore                  # Git hygiene rules
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies & npm scripts
├── README.md                   # Complete documentation
└── tsconfig.json               # Strict TypeScript configuration
```

---

## 💻 Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Full-stack TypeScript web application |
| **UI & Styling** | Vanilla CSS & CSS Modules | Bespoke cyber-investigative dark theme |
| **Database** | PostgreSQL 16 | Relational store with ACID compliance |
| **ORM** | Prisma ORM | Type-safe migrations and client generation |
| **Validation** | Zod | Runtime type validation for env & APIs |
| **Containerization** | Docker & Docker Compose | Containerized PostgreSQL with healthchecks |
| **Runtime OS** | Ubuntu on WSL 2 | Native Linux development environment |

---

## ⚙️ Prerequisites & WSL 2 Setup

Make sure the following tools are available inside your **Ubuntu WSL 2 terminal**:

```bash
# Verify Node.js (v20+ recommended, v24 tested)
node -v

# Verify npm (v10+)
npm -v

# Verify Docker inside WSL
docker --version
docker compose version
```

---

## 🚀 Quick Start Guide (WSL / Ubuntu)

### 1. Clone & Navigate to Directory
```bash
cd /home/kiddo/projects/FinTrace
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start PostgreSQL (Docker Compose)
```bash
npm run docker:up
```

### 5. Generate Prisma Client & Initialize Database
```bash
npm run db:generate
npm run db:push
```

### 6. Start the Development Server
```bash
npm run dev
```

The application will be live at:
- **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Health Check API**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **System Info API**: [http://localhost:3000/api/v1/system/info](http://localhost:3000/api/v1/system/info)

---

## 🗄️ Database Management & Docker

- **Start Database**: `npm run docker:up`
- **Stop Database**: `npm run docker:down`
- **View DB Logs**: `npm run docker:logs`
- **Open Prisma Studio (Visual DB GUI)**: `npm run db:studio` (opens on `http://localhost:5555`)
- **Run Seed Script**: `npm run db:seed`

---

## 🔐 Environment Variables

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Environment mode (`development`, `test`, `production`) |
| `PORT` | `3000` | HTTP port for Next.js server |
| `POSTGRES_USER` | `fintrace_user` | PostgreSQL database username |
| `POSTGRES_PASSWORD` | `fintrace_secure_password_2026` | PostgreSQL password |
| `POSTGRES_DB` | `fintrace_db` | PostgreSQL database name |
| `DATABASE_URL` | `postgresql://...` | Connection URI for Prisma ORM |
| `LOG_LEVEL` | `debug` | Logging threshold (`debug`, `info`, `warn`, `error`) |
| `AI_RISK_MODEL_VERSION` | `v1.0.0-sih-prototype` | Active AI risk scoring engine version |
| `RISK_HIGH_THRESHOLD` | `75` | Risk threshold for critical escalation |

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Next.js development server on `0.0.0.0:3000` |
| `npm run build` | Compiles the production build |
| `npm run start` | Runs the compiled production server |
| `npm run type-check` | Runs TypeScript compiler checks without emitting code |
| `npm run lint` | Runs Next.js ESLint rules |
| `npm run db:generate` | Generates the Prisma Client types |
| `npm run db:push` | Pushes Prisma schema changes to PostgreSQL without migrations |
| `npm run db:seed` | Runs seed verification script |
| `npm run db:studio` | Launches Prisma Studio visual database viewer |
| `npm run docker:up` | Starts the PostgreSQL container via Docker Compose |
| `npm run docker:down`| Stops the PostgreSQL container |

---

## 🏆 SIH 2026 Prototype Plan

- [x] **Foundation Setup**: Next.js 15, Prisma ORM, PostgreSQL Docker, Logger, Error Handling, WSL2 verification.
- [ ] **Phase 1**: Transaction Ingestion Engine & Schema Parsers.
- [ ] **Phase 2**: Entity Resolution & Graph Network Explorer.
- [ ] **Phase 3**: Multi-Factor Risk Engine & Explainable AI (XAI).
- [ ] **Phase 4**: Real-Time Alerts & Flagging Pipeline.
- [ ] **Phase 5**: Investigator Case Dossier Workflows.
- [ ] **Phase 6**: Admin Telemetry & Synthetic Fraud Scenarios for Live Evaluation.
