# 4. Non-Functional Requirements

[← Înapoi la Blueprint](../PRODUCT_BLUEPRINT.md) | [Next →](./05-data-model.md)

---

## Obiectiv

Definirea cerințelor tehnice, performanță, scalabilitate, disponibilitate, securitate pentru LexNotar.

---

## 4.1. Performance

### Response Time

**Target-uri per operațiune:**

| Operațiune | Target | Max Acceptabil |
|---|---|---|
| Page load (dashboard) | < 1s | 2s |
| Search dosare (< 1000 results) | < 500ms | 1s |
| Search full-text documente | < 2s | 4s |
| Document upload (10MB) | < 5s | 10s |
| Document download | < 2s | 4s |
| Generate PDF act (template) | < 3s | 6s |
| API call extern (ANAF, ONRC) | < 3s | 8s (cu timeout) |
| Database query (simple) | < 100ms | 300ms |
| Database query (complex report) | < 5s | 15s |

---

### Throughput

**Concurrent users:**
- **Small office (2-5 users):** 5 concurrent users → Smooth experience
- **Medium office (6-15 users):** 15 concurrent users → No degradation
- **Large office (16-50 users):** 50 concurrent users → < 10% performance drop

**Peak load:**
- System should handle **2x average load** during peak hours (09:00-11:00, 14:00-16:00)

---

### Document Processing

**Parallel processing:**
- OCR scan: Max 5 documents parallel (queue remaining)
- PDF generation: Max 10 parallel
- E-signature sessions: No limit (TSP handles load)

---

## 4.2. Scalability

### Horizontal Scaling

**Application servers:**
- Stateless design → Easy horizontal scaling (add more nodes)
- Load balancer (AWS ALB, Azure Load Balancer, Nginx)
- Auto-scaling rules:
  - Scale up: CPU > 70% for 5 min
  - Scale down: CPU < 30% for 15 min

**Database:**
- PostgreSQL: Master-replica (read replicas for reports)
- Connection pooling (PgBouncer)
- Sharding strategy (if > 100k cases):
  - Shard by `office_id` (each office = separate shard)
  - Or temporal sharding (year-based: cases_2025, cases_2026)

---

### Vertical Scaling Limits

**Single server max (before sharding required):**
- **Cases:** 500,000 cases
- **Documents:** 5M documents (50TB storage)
- **Users:** 500 concurrent users
- **Offices:** 200 offices (multi-tenant)

**Beyond limits:** Microservices architecture + sharding.

---

### Storage Scaling

**S3/Blob storage:**
- Virtually unlimited (cloud providers handle)
- Cost optimization: Lifecycle policies (hot → cold → glacier)

**Database size projection:**
- Small office: ~2 GB/year
- Medium office: ~10 GB/year
- Large office: ~50 GB/year
- **→ 10-year projection:** 20 GB → 1 TB (depends on office size)

---

## 4.3. Availability & Reliability

### Uptime Target

**SLA commitment:**
- **99.5% uptime** (SaaS production) → ~3.6 hours downtime/month acceptable
- **99.9% uptime** (Premium tier) → ~43 minutes downtime/month

**Maintenance windows:**
- Planned: Sunday 02:00-04:00 (low traffic)
- Notification: 7 days advance notice to clients

---

### High Availability Architecture

**Components:**
- **Application servers:** Multi-AZ deployment (AWS) or multi-region
- **Database:** Master-replica, automatic failover (< 30s)
- **Storage:** S3 cross-region replication
- **Load balancer:** Health checks, automatic node removal if unhealthy

---

### Disaster Recovery

**RTO (Recovery Time Objective):** 4 hours
- If primary region down → Manual failover to secondary region

**RPO (Recovery Point Objective):** 1 hour
- Max data loss acceptable: 1 hour (hourly incremental backups)

**Backup strategy:**
- **Database:** Daily full + hourly incremental (30 days retention)
- **Documents:** Real-time replication (S3 versioning enabled)
- **Config:** Infrastructure as Code (Terraform/CloudFormation) for rapid rebuild

**DR test:** Quarterly simulation (restore from backup, verify data integrity).

---

## 4.4. Security

### Authentication & Authorization

**User authentication:**
- **Password policy:** Min 12 chars, uppercase, lowercase, number, special char
- **2FA (Two-Factor Auth):** Optional for users, mandatory for Admin role
- **Session timeout:** 30 min inactivity → Auto logout
- **Failed login:** 5 attempts → Account lock 15 min

**Authorization:**
- **RBAC (Role-Based Access Control):** 6 roles (Notar, Senior Assistant, Assistant, Accountant, Administrator, Read-Only)
- **Per-entity permissions:** Fine-grained (ex: User can view Case but not delete)
- **Office isolation:** Multi-tenant → Office A cannot see Office B data

---

### Data Encryption

**At rest:**
- **Database:** Encryption at rest (AWS RDS encryption, Azure Transparent Data Encryption)
- **Storage:** S3/Blob server-side encryption (AES-256)
- **Backups:** Encrypted before upload to cloud

**In transit:**
- **HTTPS only:** TLS 1.3 (minimum TLS 1.2)
- **API calls:** All external integrations over HTTPS
- **Certificate:** Wildcard SSL cert (*.lexnotar.ro)

---

### Data Privacy (GDPR)

**Personal data protection:**
- **Pseudonymization:** Option to pseudonymize data in reports (CNP → hash)
- **Access logs:** All data access logged (audit trail)
- **Data retention:** 30 years (legal requirement), then anonymization
- **Right to erasure:** Implemented (with legal exceptions documented)

**DPA (Data Processing Agreement):**
- Required for SaaS customers (LexNotar = Data Processor, Notariat = Data Controller)

---

### Penetration Testing

**Frequency:** Annually (by certified security firm)

**Scope:**
- Web application vulnerabilities (OWASP Top 10)
- API security
- Infrastructure (AWS/Azure config)
- Social engineering (phishing test for staff)

**Remediation SLA:** Critical vulnerabilities patched within 48h.

---

## 4.5. Usability

### User Experience

**Design principles:**
- **Responsive:** Works on desktop (primary), tablet, mobile (view-only)
- **Accessibility:** WCAG 2.1 Level AA compliance (keyboard navigation, screen reader support)
- **Dark mode:** Optional (user preference)
- **Multi-language (Roadmap V2):** Romanian (default), English (for international clients)

---

### Learning Curve

**Target:** New assistant onboarded in **1 day** (basic tasks: create case, upload document, schedule appointment)

**Training materials:**
- Interactive tutorial (first login)
- Video tutorials (YouTube/in-app)
- Knowledge base (FAQ)
- Live chat support (business hours)

---

### Keyboard Shortcuts

**Power users (notari, asistenți seniori):**
- `Ctrl + K`: Global search (cases, clients, documents)
- `Ctrl + N`: New case
- `Ctrl + S`: Save (in forms)
- `Ctrl + P`: Print current view
- `/`: Focus search bar

---

## 4.6. Maintainability

### Code Quality

**Standards:**
- **Linting:** ESLint (frontend), Pylint/.NET Analyzer (backend)
- **Code coverage:** Minimum 70% test coverage
- **Code review:** All PRs require 1 approval before merge
- **CI/CD:** Automated tests run on every commit (GitHub Actions, GitLab CI)

---

### Documentation

**Technical docs:**
- **API documentation:** OpenAPI/Swagger (auto-generated)
- **Architecture diagrams:** Lucidchart/Draw.io (updated quarterly)
- **Deployment guide:** Step-by-step for on-premise installations
- **Runbook:** Incident response procedures

---

### Monitoring & Logging

**Observability stack:**
- **APM (Application Performance Monitoring):** New Relic, Datadog, or Elastic APM
- **Logs:** Centralized (ELK stack: Elasticsearch, Logstash, Kibana or CloudWatch)
- **Metrics:** Prometheus + Grafana
  - Dashboard KPIs: Request rate, Error rate, Response time, DB query time, Queue depth
- **Alerts:** PagerDuty/Slack integration
  - Trigger: Error rate > 5%, Response time > 3s, DB connection pool > 80%

---

### Deployment

**Deployment strategy:**
- **Blue-Green deployment:** Zero downtime deploys
- **Rollback capability:** Automated rollback if health checks fail post-deploy
- **Feature flags:** LaunchDarkly or similar (enable/disable features without deploy)

**Deployment frequency:**
- **SaaS:** Weekly releases (Thursdays 18:00, low traffic time)
- **Hotfixes:** As needed (within 2h for critical bugs)

---

## 4.7. Compatibility

### Browser Support

**Supported browsers (latest 2 versions):**
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ⚠️ IE11: Not supported (EOL 2022)

---

### Device Support

**Optimized for:**
- **Desktop:** Primary (1920x1080, 1366x768)
- **Tablet:** Secondary (iPad, Android tablets) - View & basic actions
- **Mobile:** Tertiary (iPhone, Android) - View only, notifications

**Progressive Web App (Roadmap V2):**
- Install as app on mobile
- Offline mode (view cached data)

---

### Operating Systems

**Client OS:** Any (web-based)

**Server OS (on-premise installations):**
- Linux (Ubuntu 22.04 LTS, RHEL 8/9) - Recommended
- Windows Server 2019/2022 - Supported

---

## 4.8. Compliance & Legal

### Regulatory Compliance

**Must comply:**
- ✅ **GDPR** (EU General Data Protection Regulation)
- ✅ **Law 36/1995** (Romanian notarial law)
- ✅ **eIDAS** (electronic signatures)
- ✅ **OUG 119/2022** (notarial fees)
- ✅ **ISO 27001** (Information Security Management - Roadmap certification)

---

### Audit Trails

**Immutable logging:**
- All critical actions logged (see 03g-compliance-audit.md)
- Retention: 30 years
- Tamper-proof: Append-only DB table with checksums

---

### Data Residency

**EU data residency (GDPR requirement):**
- **SaaS:** Data stored in EU region (AWS eu-west-1 Frankfurt, Azure West Europe)
- **No data transfer outside EU** (except anonymized analytics if user consents)

**On-premise:** Customer controls data location.

---

## 4.9. Localization

### Language Support

**V1 (Launch):**
- 🇷🇴 Romanian (100%)

**V2 (Roadmap):**
- 🇬🇧 English (for interface, not legal documents)
- 🇭🇺 Hungarian (for notaries in Transylvania with Hungarian clients)

---

### Date/Time Formats

**Romanian standards:**
- Date: `DD.MM.YYYY` (21.11.2025)
- Time: `HH:MM` 24-hour format (15:30)
- Timezone: EET (Eastern European Time, UTC+2 / UTC+3 in summer)

---

### Currency & Numbers

**Romanian standards:**
- Currency: RON (Lei), symbol: `RON` or `lei`
- Decimal separator: `,` (comma) - ex: 1.234,56
- Thousand separator: `.` (dot) - ex: 1.234.567

---

## 4.10. Support & SLA

### Support Tiers (SaaS)

**Basic (included in all plans):**
- E-mail support (response within 24h business hours)
- Knowledge base access
- Monthly webinars (product updates)

**Premium (paid add-on):**
- Phone support (9-18 business hours)
- Response time: 2h for critical issues
- Dedicated account manager (for 10+ user offices)

**Enterprise (custom plans):**
- 24/7 support
- Response time: 30 min for critical issues
- On-site training (initial setup)
- Custom integrations support

---

### SLA Commitments

**Uptime:** 99.5% (standard), 99.9% (premium)

**Response times:**
- **Critical** (system down): 30 min (Premium), 2h (Basic)
- **High** (major feature broken): 4h (Premium), 24h (Basic)
- **Medium** (minor bug): 24h (Premium), 3 days (Basic)
- **Low** (feature request): Best effort

---

### Bug Reporting

**Channels:**
- In-app: "Report a bug" button (auto-captures browser info, screenshot)
- E-mail: support@lexnotar.ro
- Phone: +40 XXX XXX XXX (Premium/Enterprise only)

**Severity levels:**
- **Critical:** Production down, data loss risk → Immediate escalation
- **High:** Major feature unusable → Next business day
- **Medium:** Minor feature issue → Within 1 week
- **Low:** Cosmetic, enhancement → Backlog

---

## 4.11. Cost & Licensing

### Pricing Model (SaaS)

**Tiered subscription (per office):**

**Starter:** 299 RON/month
- 1-3 users
- 500 cases/year
- 10 GB storage
- Basic support

**Professional:** 599 RON/month
- 4-10 users
- Unlimited cases
- 100 GB storage
- Premium integrations (ANAF, ONRC, QES)
- E-mail support

**Business:** 1.199 RON/month
- 11-50 users
- Unlimited cases
- 500 GB storage
- All integrations
- Phone support
- Custom reports

**Enterprise:** Custom pricing
- 50+ users
- Multi-office management
- Dedicated infrastructure (optional)
- 24/7 support
- SLA guarantees

**Add-ons:**
- Extra storage: 50 RON/month per 50 GB
- QES signatures: 3 RON/signature (or volume discount)
- SMS notifications: 0.06 RON/SMS

---

### On-Premise Licensing

**Perpetual license:**
- One-time: 15.000 RON (up to 10 users)
- Annual maintenance (optional): 20% of license (3.000 RON/year) - includes updates, support

**Subscription license:**
- Monthly: 800 RON/month (includes updates, support)

---

## 4.12. Testing Strategy

### Test Pyramid

**Unit tests (70%):**
- Backend business logic
- Frontend components (React/Vue)
- Min coverage: 70%

**Integration tests (20%):**
- API endpoints
- Database interactions
- External integrations (mocked)

**E2E tests (10%):**
- Critical user journeys:
  - Create case → Upload document → Generate act → Sign → Close case
  - Create invoice → Pay → Export report
- Tools: Playwright, Cypress

---

### Test Environments

**Environments:**
1. **Local:** Developer machines
2. **Dev:** Integration (latest code, unstable)
3. **Staging:** Pre-production (mirrors production, stable builds)
4. **Production:** Live customer data

**Data:**
- Staging: Anonymized production data (GDPR-safe)
- Dev: Synthetic test data (faker library)

---

### Performance Testing

**Load testing (quarterly):**
- Tool: JMeter, Gatling, k6
- Scenario: 100 concurrent users, 1000 requests/min
- Target: < 2s average response time, < 1% error rate

---

**[Next: Data Model →](./05-data-model.md)**
