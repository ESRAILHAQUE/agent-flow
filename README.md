# AgentFlow — AI Business Automation Platform

AgentFlow is a professional-grade, multi-tenant AI Business Automation Platform. It orchestrates Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), Tool Calling, and sequential Multi-Agent Workflows to create a centralized productivity suite for enterprises.

---

## 🚀 Key Features

* **Multi-Tenant Organization Architecture:** Independent tenant boundaries with organization level custom settings, subscriptions, and usage analytics.
* **Workspace Isolation:** Sub-workspace (teams) isolation with dedicated agent configurations, member groups, and history streams.
* **Granular Role-Based Access Control (RBAC):** Super Admin, Organization Owner, and Team Member roles guarding API gateways and UI controls.
* **Retrieval-Augmented Generation (RAG):** Native processing engine uploading files (PDF, DOCX, TXT), generating embeddings, and indexing them inside a vector store (Qdrant).
* **Multi-Agent Systems & Chains:** Build specialist agent pools equipped with unique system parameters and modular tools, chainable into execution workflows.

---

## 🛠 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Monorepo / Build** | Turborepo, PNPM Workspaces, TypeScript base configurations |
| **Frontend UI** | Next.js (App Router), Redux Toolkit, RTK Query, Tailwind CSS, Lucide Icons |
| **Backend API** | Express.js, TypeScript, NodeMailer, JWT |
| **Database & ORM** | PostgreSQL 16, Prisma ORM (Client singleton wrapper) |
| **Caching & PubSub** | Redis 7 |
| **Vector Indexing** | Qdrant Vector DB |

---

## 📁 Project Architecture

```txt
agent-flow/
├── apps/
│   ├── api/                   # Express.js backend server
│   └── web/                   # Next.js App Router client application
├── packages/
│   ├── database/              # Prisma Schema, generated client, and seed scripts
│   └── shared/                # Zod validation schemas, API schemas, and constants
├── docker-compose.yml         # Dev services setup (Postgres + Redis + Qdrant)
├── package.json               # Root workspace manifest
├── pnpm-workspace.yaml        # Workspace configuration
└── turbo.json                 # Turborepo task pipeline configuration
```

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [PNPM](https://pnpm.io/) (`npm i -g pnpm`)
* [Docker & Docker Compose](https://www.docker.com/)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/Esrail2/agent-flow.git
cd agent-flow
pnpm install
```

### 3. Spin Up Infrastructure Services
Start the local database, cache, and vector store instances:
```bash
docker compose up -d
```

### 4. Database Setup & Seeding
Configure your connection URL in `apps/api/.env` and `packages/database/.env`, then run migrations and seed dev accounts:
```bash
# Generate Prisma Client & Migrate PostgreSQL
pnpm --filter @agentflow/database db:migrate

# Run Development Database Seeding
pnpm --filter @agentflow/database db:seed
```

### 5. Run Development Server
Start both Next.js frontend and Express API backend in concurrent hot-reload mode:
```bash
pnpm dev
```
- **Frontend Dashboard:** `http://localhost:3000`
- **Backend API Server:** `http://localhost:4000/api`

---

## 🗺 Platform Roadmap

* **[x] Phase 1:** Monorepo Workspace, TS configurations, and DB seeding foundation.
* **[x] Phase 2:** JWT Authentication, verification, and frontend auth flows.
* **[x] Phase 3:** Workspace Management, Organizations Settings, and teammate invitations.
* **[ ] Phase 4:** RAG Engine (PDF Chunking, Embeddings, Qdrant Indexing).
* **[ ] Phase 5:** AI Chat Assistant & Tool Calling.
* **[ ] Phase 6:** Multi-Agent Workflow Engine.
* **[ ] Phase 7:** Admin Analytics Dashboard.
* **[ ] Phase 8:** Billing integration (Stripe) and Production Deployment.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
