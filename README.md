<div align="center">

# AgentFlow 🤖⚡

**The Ultimate AI-Powered Business Automation Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![pnpm](https://img.shields.io/badge/pnpm-monorepo-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)

AgentFlow is an enterprise-grade AI automation platform that unifies Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), and Multi-Agent Workflows to streamline customer support, knowledge management, lead handling, and internal business operations.

</div>

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🗄️ Database ER Diagram](#️-database-er-diagram)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🐳 Docker Setup](#-docker-setup)
- [📡 API Overview](#-api-overview)
- [🛡️ Security](#️-security)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **Multi-Agent Workflow Engine** | Visually design pipelines where specialized agents (Manager, Research, Writer, Reviewer) collaborate |
| 📚 **RAG Knowledge Base** | Upload PDFs, DOCXs, and TXTs to build a vector database for context-aware AI responses |
| 🔧 **Dynamic Tool Calling** | Native integrations for Weather, Email, CRM sync, and internal Databases |
| 🏢 **Multi-Tenant RBAC** | Super Admin, Org Owner, and Team Member roles with strict data isolation |
| 💳 **Stripe Billing & Quotas** | Built-in subscription management (Free, Pro, Enterprise) with hard plan limits and usage tracking |
| 🔑 **BYOK (Bring Your Own Key)** | Users can provide their own OpenAI/OpenRouter API keys (stored with AES-256 encryption) for custom billing |
| 📊 **Analytics Dashboard** | Real-time usage metrics, token consumption, and agent performance tracking |
| 🔐 **Secure Auth** | JWT-based authentication with email verification and Google OAuth support |

---

## 🏗️ System Architecture

AgentFlow utilizes a highly scalable, decoupled **monorepo architecture** designed for performance and maintainability.

### High-Level Architecture

```mermaid
graph TD
    Client["🖥️ Web Client\nNext.js + TypeScript"] -->|REST API| API["⚙️ API Server\nNode.js / Express"]
    API --> DB[("🐘 PostgreSQL\n+ Prisma ORM")]
    API --> Redis[("⚡ Redis\nCache & Sessions")]
    API --> VectorDB[("🔍 Qdrant\nVector Database")]
    API --> AI["🧠 AI Layer\nOpenAI / OpenRouter\nLangChain / LangGraph"]
    API --> Storage["☁️ Storage\nAWS S3 / Cloudinary"]
    API --> Stripe["💳 Stripe\nBilling & Payments"]

    style Client fill:#0f172a,stroke:#6366f1,color:#e2e8f0
    style API fill:#0f172a,stroke:#10b981,color:#e2e8f0
    style DB fill:#0f172a,stroke:#3b82f6,color:#e2e8f0
    style Redis fill:#0f172a,stroke:#ef4444,color:#e2e8f0
    style VectorDB fill:#0f172a,stroke:#f59e0b,color:#e2e8f0
    style AI fill:#0f172a,stroke:#8b5cf6,color:#e2e8f0
    style Storage fill:#0f172a,stroke:#06b6d4,color:#e2e8f0
    style Stripe fill:#0f172a,stroke:#ec4899,color:#e2e8f0
```

### Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, ShadCN UI, Redux Toolkit, React Flow |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL 15+, Prisma ORM |
| **AI / ML** | OpenAI API, OpenRouter API, LangChain, LangGraph |
| **Vector Search** | Qdrant |
| **Cache** | Redis |
| **Auth** | JWT, Google OAuth 2.0, Bcrypt |
| **Storage** | AWS S3, Cloudinary |
| **Payments** | Stripe |
| **DevOps** | Docker, Turborepo, pnpm workspaces |

---

## 🗄️ Database ER Diagram

The following diagram represents the complete relational database schema for AgentFlow, showing all entities, their attributes, and relationships.

```mermaid
erDiagram
    User {
        String id PK
        String email UK
        String password
        String name
        String avatar
        UserRole role
        Boolean emailVerified
        String googleId UK
        String refreshToken
        String verificationToken UK
        DateTime verificationExpiry
        String resetToken UK
        DateTime resetTokenExpiry
        DateTime createdAt
        DateTime updatedAt
    }

    Organization {
        String id PK
        String name
        String slug UK
        String logo
        OrgPlan plan
        Json settings
        String ownerId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Team {
        String id PK
        String name
        String orgId FK
        DateTime createdAt
        DateTime updatedAt
    }

    TeamMember {
        String id PK
        TeamMemberRole role
        String teamId FK
        String userId FK
        String invitedEmail
        String inviteToken UK
        Boolean inviteAccepted
        DateTime createdAt
        DateTime updatedAt
    }

    Agent {
        String id PK
        String name
        String description
        String persona
        String modelId
        Json tools
        Boolean isActive
        String orgId FK
        String createdById FK
        DateTime createdAt
        DateTime updatedAt
    }

    Conversation {
        String id PK
        String title
        String agentType
        Json metadata
        String orgId FK
        String userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Message {
        String id PK
        MessageRole role
        String content
        Int tokens
        Json toolCalls
        Json toolResults
        Json metadata
        String conversationId FK
        DateTime createdAt
    }

    Document {
        String id PK
        String name
        DocumentType type
        String url
        Int size
        DocumentStatus status
        Json metadata
        String error
        String orgId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Embedding {
        String id PK
        String content
        String vectorId UK
        Int chunkIndex
        Json metadata
        String documentId FK
        DateTime createdAt
    }

    Lead {
        String id PK
        String name
        String email
        String phone
        String company
        LeadStatus status
        String source
        String notes
        Json metadata
        String orgId FK
        String createdById FK
        DateTime createdAt
        DateTime updatedAt
    }

    Subscription {
        String id PK
        OrgPlan plan
        SubscriptionStatus status
        String stripeCustomerId UK
        String stripeSubscriptionId UK
        String stripePriceId
        DateTime currentPeriodStart
        DateTime currentPeriodEnd
        String orgId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Payment {
        String id PK
        Int amount
        String currency
        PaymentStatus status
        String stripePaymentId UK
        String invoiceUrl
        Json metadata
        String subscriptionId FK
        DateTime createdAt
    }

    UsageRecord {
        String id PK
        UsageType type
        Int count
        String month
        String orgId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Workflow {
        String id PK
        String name
        String description
        Boolean isActive
        Json viewport
        String orgId FK
        String createdById FK
        DateTime createdAt
        DateTime updatedAt
    }

    WorkflowNode {
        String id PK
        String type
        Float positionX
        Float positionY
        Json data
        String workflowId FK
        DateTime createdAt
    }

    WorkflowEdge {
        String id PK
        String sourceId
        String targetId
        String sourceHandle
        String targetHandle
        String workflowId FK
        DateTime createdAt
    }

    %% Relationships
    User ||--o{ Organization : "owns"
    User ||--o{ TeamMember : "belongs to"
    User ||--o{ Conversation : "has"
    User ||--o{ Lead : "creates"
    User ||--o{ Agent : "creates"
    User ||--o{ Workflow : "creates"

    Organization ||--o{ Team : "has"
    Organization ||--o{ Document : "has"
    Organization ||--o{ Conversation : "has"
    Organization ||--o{ Lead : "has"
    Organization ||--o{ Agent : "has"
    Organization ||--o{ Workflow : "has"
    Organization ||--|| Subscription : "has"
    Organization ||--o{ UsageRecord : "tracks"

    Team ||--o{ TeamMember : "has"

    Document ||--o{ Embedding : "generates"

    Conversation ||--o{ Message : "contains"

    Subscription ||--o{ Payment : "records"

    Workflow ||--o{ WorkflowNode : "contains"
    Workflow ||--o{ WorkflowEdge : "contains"
```

---

## 📁 Project Structure

This project is organized as a **pnpm monorepo** managed by [Turborepo](https://turbo.build/repo).

```
agent-flow/
├── apps/
│   ├── api/                    # Express.js Backend API
│   │   └── src/
│   │       ├── modules/        # Feature modules (auth, org, agent, ...)
│   │       ├── middleware/     # Auth, rate-limiting, error handling
│   │       └── index.ts        # Entry point
│   └── web/                    # Next.js Frontend Application
│       └── src/
│           ├── app/            # App Router pages & layouts
│           ├── components/     # Reusable UI components
│           └── store/          # Redux state management
├── packages/
│   ├── database/               # Prisma schema & migrations
│   │   └── prisma/
│   │       └── schema.prisma
│   └── shared/                 # Shared TypeScript types & utilities
├── docker-compose.yml          # Local dev infrastructure
├── turbo.json                  # Turborepo pipeline config
└── pnpm-workspace.yaml         # Workspace definition
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org) **v18+**
- [pnpm](https://pnpm.io) **v8+** — `npm install -g pnpm`
- [Docker](https://www.docker.com) (recommended for local infrastructure)
- [PostgreSQL](https://www.postgresql.org) **v15+**
- [Redis](https://redis.io)
- [Qdrant](https://qdrant.tech) Vector Database

### 1. Clone the repository

```bash
git clone https://github.com/your-org/agent-flow.git
cd agent-flow
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

> Fill in the required values. See [Environment Variables](#️-environment-variables) section for details.

### 4. Start infrastructure with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, and Qdrant locally.

### 5. Setup the database

```bash
# Generate Prisma client
pnpm --filter @agentflow/database prisma generate

# Push schema to database
pnpm --filter @agentflow/database prisma db push

# (Optional) Seed the database
pnpm --filter @agentflow/database prisma db seed
```

### 6. Run in development mode

```bash
pnpm dev
```

| Service | URL |
|---|---|
| 🖥️ Web App | http://localhost:3000 |
| ⚙️ API Server | http://localhost:5000 |
| 🔍 Prisma Studio | `pnpm --filter @agentflow/database prisma studio` |

### 7. Production build

```bash
pnpm build
pnpm start
```

---

## ⚙️ Environment Variables

### API (`apps/api/.env`)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agentflow"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# AI Providers
OPENAI_API_KEY="sk-..."
OPENROUTER_API_KEY="sk-or-..."

# Vector Database
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY="your-qdrant-api-key"

# Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="agentflow-uploads"
CLOUDINARY_URL="cloudinary://..."

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SMTP_HOST="smtp.resend.com"
SMTP_PORT=465
SMTP_USER="resend"
SMTP_PASS="re_..."
EMAIL_FROM="no-reply@agentflow.io"

# App
NODE_ENV="development"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
```

---

## 🐳 Docker Setup

For a fully containerized local development environment:

```bash
# Start all services (PostgreSQL, Redis, Qdrant)
docker-compose up -d

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The `docker-compose.yml` exposes:
- **PostgreSQL** → `localhost:5432`
- **Redis** → `localhost:6379`
- **Qdrant** → `localhost:6333`

---

## 📡 API Overview

The REST API is structured around feature modules:

| Module | Base Path | Description |
|---|---|---|
| Auth | `/api/auth` | Login, register, OAuth, token refresh |
| Users | `/api/users` | User profile management |
| Organizations | `/api/org` | Org CRUD, settings, members |
| Teams | `/api/teams` | Team management & invitations |
| Agents | `/api/agents` | AI agent creation & configuration |
| Conversations | `/api/conversations` | Chat sessions & message history |
| Documents | `/api/documents` | Knowledge base upload & management |
| Leads | `/api/leads` | CRM lead tracking |
| Workflows | `/api/workflows` | Visual workflow builder |
| Billing | `/api/billing` | Stripe subscriptions & payments |
| Admin | `/api/admin` | Super admin controls |

---

## 🛡️ Security

- **Authentication:** Stateless JWT with short-lived access tokens and rotating refresh tokens.
- **Authorization:** Role-Based Access Control (RBAC) — `SUPER_ADMIN`, `ORG_OWNER`, `TEAM_MEMBER`.
- **Data Isolation:** All queries are scoped by `orgId` ensuring strict multi-tenant separation.
- **Data at Rest:** Organization API keys (BYOK) are stored securely using AES-256-CBC encryption.
- **Rate & Plan Limiting:** AI endpoints are protected against abuse. Hard quotas (Agent/Document limits) are enforced by subscription tier.
- **Password Hashing:** Bcrypt with configurable salt rounds.
- **Input Validation:** Zod schemas validate all incoming request payloads.
- **CORS:** Strict origin whitelisting in production.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by the AgentFlow Team

</div>
