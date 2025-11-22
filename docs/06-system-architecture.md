# 6. System Architecture

[← Înapoi la Blueprint](../PRODUCT_BLUEPRINT.md) | [← Previous](./05-data-model.md) | [Next →](./07-security-infrastructure.md)

---

## Obiectiv

Definirea arhitecturii tehnice, componente sistem, deployment options, stack tehnologic.

---

## 6.1. Architecture Overview

### High-Level Architecture (SaaS Multi-Tenant)

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
│  (Notari, Asistenți, Contabili, Clienți portal)           │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   LOAD BALANCER                             │
│          (AWS ALB / Azure Load Balancer / Nginx)            │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│  Web Server  │          │  Web Server  │  (Auto-scaling)
│    Node 1    │          │    Node 2    │
└──────┬───────┘          └──────┬───────┘
       │                         │
       └────────────┬────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│   APPLICATION    │    │   BACKGROUND     │
│     SERVERS      │    │      JOBS        │
│  (REST/GraphQL)  │    │  (Workers/Queue) │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         └───────────┬───────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌─────────────┐ ┌────────────┐ ┌──────────────┐
│  PostgreSQL │ │   Redis    │ │  S3/Blob     │
│  (Primary)  │ │  (Cache)   │ │  (Documents) │
└──────┬──────┘ └────────────┘ └──────────────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │
│  (Replica)  │
│ (Read-only) │
└─────────────┘

        External Integrations:
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│   ANAF   │ │   ONRC   │ │ QES (TSP)│ │   ANCPI  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## 6.2. Technology Stack

### 6.2.1. Frontend

**Framework:** React 18+ sau Vue 3+

**Reasoning:**
- **React:** Ecosistem mare, community, React Query pentru data fetching
- **Vue:** Curba learning mai blândă, excellent pentru rapiditate dezvoltare

**Recommended:** React (pentru long-term maintainability, talent pool mai mare)

**State Management:**
- **React:** Zustand sau Redux Toolkit
- **Vue:** Pinia

**UI Component Library:**
- **Ant Design** (comprehensive, Romanian locale support)
- **Material-UI** (modern, Google design)
- **Shadcn/ui** (modern, Tailwind-based, highly customizable)

**Styling:** Tailwind CSS (utility-first, rapid development)

**Build Tool:** Vite (fast HMR, modern)

**TypeScript:** Obligatoriu (type safety, better DX)

---

### 6.2.2. Backend

**Option A: .NET Core 8+ (C#)** ⭐ Recommended

**Pros:**
- Performanță excelentă
- Type safety nativ
- Azure integration smooth (dacă deploy Azure)
- Entity Framework Core (ORM matur)
- Strong typing reduce bugs

**Stack:**
- Framework: ASP.NET Core Web API
- ORM: Entity Framework Core
- Auth: ASP.NET Identity + JWT
- API Docs: Swashbuckle (Swagger/OpenAPI)

---

**Option B: Node.js (TypeScript)**

**Pros:**
- Limbaj unificat (JS/TS frontend + backend)
- NPM ecosystem vast
- Bun pentru rapid prototyping

**Stack:**
- Framework: NestJS (structure, scalable) sau Express + TypeScript
- ORM: Prisma sau TypeORM
- Auth: Passport.js + JWT
- API Docs: Swagger (decorators în NestJS)

---

**Recommendation:** **.NET Core** pentru LexNotar
- Notarial software = mission-critical, long-term maintenance
- .NET = enterprise-grade, performant, type-safe
- Azure ecosystem (dacă SaaS deploy în Azure)

---

### 6.2.3. Database

**Primary: PostgreSQL 15+** ⭐

**Reasoning:**
- Open-source, robust, proven
- JSONB support (pentru metadata flexibil)
- Full-text search (pentru OCR text)
- Excellent pentru multi-tenant (RLS - Row Level Security)
- GIN indexes (pentru arrays, JSONB)
- Conform GDPR (data în EU)

**Alternatives considered:**
- **MySQL:** Ok, dar PostgreSQL superior pentru complex queries
- **SQL Server:** Excellent (dacă .NET), dar licensing cost (on-premise), Azure SQL ok pentru SaaS

---

### 6.2.4. Cache

**Redis 7+**

**Use cases:**
- Session storage (distributed sessions)
- API rate limiting
- Cache rezultate API externe (ANAF, ONRC) - TTL 24h
- Queue pentru background jobs (Redis Bull/BullMQ)
- Pub/Sub pentru real-time notifications

---

### 6.2.5. Storage

**Documents:** AWS S3 sau Azure Blob Storage

**Reasoning:**
- Scalabil (virtually unlimited)
- Cost-efficient (lifecycle policies: hot → cold → glacier)
- Durability: 99.999999999% (11 nines)
- Versioning built-in
- Cross-region replication (DR)

**Structure:**
```
s3://lexnotar-documents/
  ├── office_{OFFICE_ID}/
  │   ├── case_{CASE_ID}/
  │   │   ├── doc_{DOC_ID}_filename.pdf
  │   │   ├── doc_{DOC_ID}_filename_v2.pdf
  │   │   └── doc_{DOC_ID}_signed.pdf
  │   └── templates/
  │       └── template_{TEMPLATE_ID}.docx
  └── system/
      └── templates/
          └── default_act_vanzare.docx
```

---

### 6.2.6. Background Jobs

**Queue System:** Redis-based (Bull/BullMQ pentru Node.js, Hangfire pentru .NET)

**Jobs:**
- **Daily (02:00):**
  - Database backup
  - BNR currency rate fetch
  - Appointment reminders (pentru următoarea zi)
  - Task deadline reminders
  - Signature validation (check OCSP)
  
- **Weekly (Sunday 03:00):**
  - Generate weekly reports
  - Cleanup old sessions
  
- **Monthly:**
  - Repertoriu validation (check continuity)
  - Anonymize old data (30+ years)

---

### 6.2.7. Search

**Full-Text Search:**

**Option A: PostgreSQL Built-in** (Recommended pentru MVP)
- `tsvector` + GIN indexes
- Romanian language support (`to_tsvector('romanian', text)`)
- Sufficient pentru < 1M documents

**Option B: Elasticsearch** (pentru scale, > 1M documents)
- Distributed search
- Advanced features (fuzzy search, aggregations)
- Kibana pentru logs
- Overhead: Complex setup, maintenance

**Recommendation:** Start cu PostgreSQL FTS, migrate la Elasticsearch dacă necesită scale.

---

### 6.2.8. Monitoring & Observability

**APM (Application Performance Monitoring):**
- **New Relic** (comprehensive, ușor de integrat)
- **Datadog** (excellent, multi-cloud)
- **Elastic APM** (open-source, self-hosted)
- **Azure Application Insights** (dacă deploy Azure)

**Logs:**
- **Centralized:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Cloud:** AWS CloudWatch, Azure Monitor

**Metrics:**
- **Prometheus + Grafana** (open-source, industry standard)
- Dashboard KPIs:
  - Request rate (req/s)
  - Response time (p50, p95, p99)
  - Error rate (%)
  - Database query time
  - Cache hit rate

**Alerts:** PagerDuty sau OpsGenie (incident management)

---

## 6.3. API Design

### 6.3.1. REST vs GraphQL

**REST API (Recommended pentru LexNotar)**

**Pros:**
- Simplu, standard
- Cache-able (HTTP caching)
- Tooling matur (Swagger/OpenAPI)

**Endpoint Examples:**
```
GET    /api/v1/cases                  # List cases
POST   /api/v1/cases                  # Create case
GET    /api/v1/cases/{id}             # Get case details
PATCH  /api/v1/cases/{id}             # Update case
DELETE /api/v1/cases/{id}             # Delete case (soft)

GET    /api/v1/cases/{id}/documents   # List case documents
POST   /api/v1/documents/{id}/sign    # Initiate signing

GET    /api/v1/repertory?year=2025    # Repertory entries
POST   /api/v1/repertory              # Create entry

GET    /api/v1/search?q=popescu&type=client  # Global search
```

---

**GraphQL (Optional pentru advanced use cases)**

**Pros:**
- Single endpoint, client specify exact data needed
- Reduce over-fetching
- Excellent pentru mobile apps (bandwidth optimization)

**Cons:**
- Complex caching
- Learning curve

**Recommendation:** REST pentru V1, GraphQL roadmap pentru V2 mobile app.

---

### 6.3.2. API Versioning

**Strategy:** URL versioning

**Format:** `/api/v1/...`, `/api/v2/...`

**Deprecation policy:**
- V1 supported 12 months after V2 release
- Breaking changes = new version
- Non-breaking changes = patch în current version

---

### 6.3.3. Authentication & Authorization

**Authentication: JWT (JSON Web Tokens)**

**Flow:**
```
1. POST /api/v1/auth/login
   Body: { "email": "...", "password": "..." }
   
2. Server validates credentials
   
3. Response: { 
     "access_token": "eyJhbGc...",  // Expires in 1h
     "refresh_token": "...",         // Expires in 7 days
     "user": { ... }
   }
   
4. Client: Store tokens (secure HttpOnly cookies sau localStorage)
   
5. Subsequent requests:
   Header: Authorization: Bearer eyJhbGc...
   
6. Token expired? POST /api/v1/auth/refresh
   Body: { "refresh_token": "..." }
   → New access_token
```

**Token Claims:**
```json
{
  "sub": "user_id_uuid",
  "email": "maria@example.com",
  "office_id": "office_uuid",
  "role": "notar",
  "permissions": ["case.read", "case.write", "case.delete"],
  "iat": 1700000000,
  "exp": 1700003600
}
```

---

**Authorization: RBAC (Role-Based Access Control)**

**Roles:** (defined în 02-user-personas.md)
- `admin`, `notar`, `senior_assistant`, `assistant`, `accountant`, `read_only`

**Permissions Matrix:**

| Resource | Admin | Notar | Sr.Asst | Asst | Acct | ReadOnly |
|---|---|---|---|---|---|---|
| Case: Create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Case: Update | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Case: Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Document: Upload | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Document: Sign | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Invoice: Create | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Invoice: Pay | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Repertory: Create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| User: Manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reports: View All | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

**Implementation:**
- Middleware/Attribute: `[Authorize(Roles = "notar,admin")]`
- Fine-grained: `[Authorize(Policy = "CanDeleteCase")]`

---

## 6.4. Multi-Tenancy Strategy

### Approach: Shared Database, Row-Level Isolation

**Reasoning:**
- Cost-efficient (single DB instance pentru multiple offices)
- Easy maintenance (schema updates apply la toți tenants)
- Scalabil până la 200-500 offices per DB instance

**Implementation:**
- Fiecare tabel: `office_id` column (FK → Office)
- Queries: `WHERE office_id = {current_user.office_id}`
- PostgreSQL RLS (Row Level Security) pentru enforcement automat:

```sql
CREATE POLICY office_isolation_policy ON cases
  USING (office_id = current_setting('app.current_office_id')::uuid);
```

**Application:** Set context la fiecare request:
```sql
SET app.current_office_id = 'office_uuid';
```

**Benefit:** Imposibil ca Office A să vadă datele Office B (DB-level enforcement).

---

### Alternative: Database per Tenant

**Use case:** Enterprise clients (very large offices, 50+ users)

**Pros:**
- Full isolation
- Performanță dedicată
- Custom schema per tenant (dacă necesită)

**Cons:**
- Complex maintenance (schema migrations × N databases)
- Backup individual per DB

**Recommendation:** Offer ca option pentru "Enterprise" tier.

---

## 6.5. Deployment Architecture

### 6.5.1. SaaS Deployment (AWS Example)

```
┌─────────────────────────────────────────────────────────────┐
│                      Route 53 (DNS)                         │
│                  lexnotar.ro → ALB IP                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              CloudFront (CDN) - Optional                    │
│          (Static assets: JS, CSS, Images)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│      Application Load Balancer (ALB)                        │
│              SSL Termination (ACM cert)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│   ECS Fargate    │      │   ECS Fargate    │
│   (Container 1)  │      │   (Container 2)  │
│  App + Frontend  │      │  App + Frontend  │
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         └────────────┬────────────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
┌─────────────────┐ ┌─────────┐ ┌──────────┐
│  RDS PostgreSQL │ │ ElastiC │ │    S3    │
│  (Multi-AZ)     │ │  ache   │ │ (Docs)   │
│  Primary+Replica│ │ (Redis) │ │          │
└─────────────────┘ └─────────┘ └──────────┘

Background Jobs:
┌──────────────────┐
│  ECS Fargate     │
│  (Worker tasks)  │
└──────────────────┘
```

**Components:**
- **Route 53:** DNS management
- **ALB:** Load balancing, SSL termination, health checks
- **ECS Fargate:** Containerized app (Docker), auto-scaling
- **RDS PostgreSQL:** Multi-AZ (auto-failover), automated backups
- **ElastiCache Redis:** Managed Redis cluster
- **S3:** Document storage (versioning, lifecycle policies)
- **CloudWatch:** Logs, metrics, alarms

**Cost estimate (Monthly, Medium traffic - 50 concurrent users):**
- ECS Fargate (2 tasks, 2 vCPU, 4GB RAM): ~$150
- RDS PostgreSQL (db.t3.large, Multi-AZ): ~$300
- ElastiCache Redis (cache.t3.medium): ~$60
- S3 (500 GB storage + transfer): ~$25
- Data transfer, ALB, CloudWatch: ~$100
- **Total:** ~$635/month (variază cu usage)

---

### 6.5.2. Azure Deployment (Alternative)

**Components:**
- **Azure App Service** (Web app + API)
- **Azure SQL Database** sau **Azure Database for PostgreSQL**
- **Azure Cache for Redis**
- **Azure Blob Storage**
- **Azure Application Gateway** (load balancer)
- **Azure Application Insights** (monitoring)

**Similar cost:** ~$600-800/month pentru medium setup.

---

### 6.5.3. On-Premise Deployment

**Target:** Notariate care vor control complet, fără cloud.

**Architecture:**

```
┌─────────────────────────────────────┐
│         Nginx (Reverse Proxy)       │
│       SSL, Load Balancing           │
└────────────┬────────────────────────┘
             │
     ┌───────┴───────┐
     │               │
     ▼               ▼
┌──────────┐   ┌──────────┐
│ App VM 1 │   │ App VM 2 │  (Optional HA)
└────┬─────┘   └────┬─────┘
     │              │
     └──────┬───────┘
            │
    ┌───────┼───────┐
    │       │       │
    ▼       ▼       ▼
┌────────┐ ┌───┐ ┌──────┐
│ PostgreSQL│ │Redis│ │ NAS/ │
│  (Local)  │ │     │ │ SAN  │
└───────────┘ └───┘ └──────┘
                    (Storage)
```

**Requirements:**
- **Hardware:**
  - Server: Min 8 cores, 16GB RAM, 500GB SSD (pentru < 10 users)
  - Storage: NAS/SAN pentru documents (min 2TB, RAID configurare)
  
- **OS:** Ubuntu 22.04 LTS sau Windows Server 2022
  
- **Software:**
  - PostgreSQL 15+ (local install)
  - Redis (local)
  - Nginx (reverse proxy)
  - Docker (optional, pentru containerized deployment)

**Deployment Package:**
- Docker Compose file (dacă containerized)
- Install script (Bash/PowerShell)
- Database migration scripts
- Configuration templates

**Backup:**
- Daily PostgreSQL dump → External NAS/USB
- Weekly full system backup (Veeam, Acronis)
- Offsite backup (Cloud Glacier sau external location)

---

## 6.6. CI/CD Pipeline

### GitHub Actions (sau GitLab CI)

**Workflow:**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run linter
        run: npm run lint
      - name: Run tests
        run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t lexnotar:${{ github.sha }} .
      - name: Push to ECR/ACR
        run: |
          docker tag lexnotar:${{ github.sha }} $ECR_REPO:latest
          docker push $ECR_REPO:latest

  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: |
          aws ecs update-service --cluster staging --service lexnotar --force-new-deployment

  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          aws ecs update-service --cluster production --service lexnotar --force-new-deployment
```

**Stages:**
1. **Lint & Test:** ESLint, Jest/Vitest (frontend), xUnit/.NET tests (backend)
2. **Build:** Docker image build
3. **Push:** ECR/ACR/DockerHub
4. **Deploy Staging:** Auto-deploy `develop` branch
5. **Deploy Production:** Auto-deploy `main` branch (după manual approval opcional)

---

## 6.7. Security Architecture

### 6.7.1. Network Security

**SaaS (AWS):**
- **VPC:** Private network, subnets (public pentru ALB, private pentru App + DB)
- **Security Groups:** Firewall rules:
  - ALB: Allow 443 (HTTPS) from 0.0.0.0/0
  - App: Allow traffic from ALB only
  - RDS: Allow 5432 (PostgreSQL) from App security group only
- **NAT Gateway:** App needs internet pentru external API calls (ANAF, ONRC)

**On-Premise:**
- **Firewall:** Allow 443 inbound, block all other inbound
- **VPN:** Pentru remote access administrator (optional)

---

### 6.7.2. Application Security

**OWASP Top 10 Mitigation:**

1. **Injection (SQL Injection):**
   - ORM (Entity Framework, Prisma) → Parameterized queries
   - Input validation (Joi, Zod, FluentValidation)

2. **Broken Authentication:**
   - JWT tokens (short-lived, 1h expiry)
   - Refresh tokens (secure HttpOnly cookies)
   - 2FA (TOTP via Google Authenticator)
   - Rate limiting login attempts

3. **Sensitive Data Exposure:**
   - Encryption at rest (RDS encryption, S3 SSE)
   - Encryption in transit (TLS 1.3)
   - No sensitive data în logs (mask CNP, passwords)

4. **XML External Entities (XXE):**
   - N/A (no XML parsing în LexNotar)

5. **Broken Access Control:**
   - RBAC enforcement (middleware)
   - Row-level security (PostgreSQL RLS)
   - Test: "Can User A access Office B data?" → No

6. **Security Misconfiguration:**
   - Disable debug mode în production
   - Remove default credentials
   - Security headers (HSTS, CSP, X-Frame-Options)

7. **Cross-Site Scripting (XSS):**
   - React/Vue auto-escape (dangerouslySetInnerHTML only când necesar)
   - CSP headers

8. **Insecure Deserialization:**
   - Validate JSON input (schema validation)

9. **Using Components with Known Vulnerabilities:**
   - Dependabot (GitHub) → Auto PR pentru dependency updates
   - `npm audit`, `dotnet list package --vulnerable`

10. **Insufficient Logging & Monitoring:**
    - Comprehensive audit log (vezi 05-data-model.md, ActivityLog)
    - Alerts pentru anomalies (ex: 100 failed logins)

---

### 6.7.3. Data Encryption

**At Rest:**
- **Database:** RDS encryption (AES-256) sau PostgreSQL pgcrypto
- **Storage:** S3 SSE (Server-Side Encryption) sau Azure Blob encryption
- **Backups:** Encrypted before upload

**In Transit:**
- **HTTPS:** TLS 1.3 (minimum TLS 1.2)
- **API calls externe:** HTTPS only (ANAF, ONRC, TSP)

**Key Management:**
- **AWS KMS** (Key Management Service) sau **Azure Key Vault**
- Rotate keys annually
- Separate keys per environment (staging/production)

---

## 6.8. Disaster Recovery Plan

### RTO & RPO

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour

### Backup Strategy

**Database:**
- **Automated daily backups:** RDS automated backups (retain 30 days)
- **Manual snapshots:** Weekly (retain 90 days)
- **Point-in-time recovery:** Enabled (restore to any second în last 30 days)

**Documents (S3):**
- **Versioning:** Enabled (keep last 10 versions)
- **Cross-region replication:** EU-West-1 (Frankfurt) → EU-West-2 (London)
- **Lifecycle:** 90 days Standard → Glacier (cost optimization)

**Restore Process:**
1. Detect failure (monitoring alerts)
2. Escalate (PagerDuty → Incident Commander)
3. Restore DB from latest backup (RDS restore = 30-60 min)
4. Point app to restored DB
5. Verify data integrity (sample checks)
6. Switch DNS (Route 53) sau load balancer to restored environment
7. Monitor (verify no errors)

**Quarterly DR Test:** Simulate failure, measure actual RTO.

---

## 6.9. Scalability Plan

### Vertical Scaling (Phase 1: 0-50 offices)

**Current setup sufficient:**
- App: 2-4 ECS tasks
- DB: db.t3.large (2 vCPU, 8GB RAM)

### Horizontal Scaling (Phase 2: 50-200 offices)

**App tier:**
- Auto-scaling: 4-16 ECS tasks (based on CPU/Memory)

**DB tier:**
- Upgrade: db.m5.xlarge (4 vCPU, 16GB RAM)
- Read replicas: Add 1-2 read replicas pentru reports/analytics

**Cache:**
- Redis cluster (multi-node pentru HA)

### Sharding (Phase 3: 200+ offices)

**Shard by `office_id`:**
- DB 1: Offices 1-100
- DB 2: Offices 101-200
- DB 3: Offices 201-300

**Router:** Application logic determine shard based on `office_id` hash.

**Limitation:** Cross-office queries difficult (rare în multi-tenant).

---

## 6.10. Technology Alternatives Summary

| Component | Recommended | Alternative 1 | Alternative 2 |
|---|---|---|---|
| **Frontend** | React + TypeScript | Vue 3 + TypeScript | Angular |
| **Backend** | .NET Core 8 | Node.js + NestJS | Python + FastAPI |
| **Database** | PostgreSQL | Azure SQL | MySQL |
| **Cache** | Redis | Memcached | - |
| **Storage** | AWS S3 | Azure Blob | MinIO (self-hosted) |
| **Queue** | Redis (Bull) | RabbitMQ | AWS SQS |
| **Search** | PostgreSQL FTS | Elasticsearch | Algolia |
| **Monitoring** | New Relic | Datadog | Elastic APM |
| **Deployment** | AWS ECS | Azure App Service | Kubernetes |

---

**[Next: Security & Infrastructure →](./07-security-infrastructure.md)**
