# 8. Implementation Roadmap

[← Înapoi la Blueprint](../PRODUCT_BLUEPRINT.md) | [← Previous](./07-security-infrastructure.md)

---

## Obiectiv

Plan de implementare în faze, timeline-uri realistice, priorități features, resource planning.

---

## 8.1. Development Phases Overview

### Timeline Total: 12-18 luni (MVP → V1.0 Production)

```
Phase 0: Foundation (Luni 1-2)
Phase 1: MVP Core (Luni 3-6)
Phase 2: Extended Features (Luni 7-10)
Phase 3: Advanced Features (Luni 11-14)
Phase 4: Polish & Launch (Luni 15-18)
```

---

## 8.2. Phase 0: Foundation & Setup (Luni 1-2)

### Obiective

- Setup proiect, infrastructure, CI/CD
- Architecture decisions finalizate
- Team onboarding

### Tasks

**Week 1-2: Project Setup**
- ✅ Git repository (GitHub/GitLab)
- ✅ Branching strategy (Git Flow: `main`, `develop`, feature branches)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Development environment setup (Docker Compose)
- ✅ Code standards (ESLint, Prettier, EditorConfig)
- ✅ Documentation structure (README, CONTRIBUTING, wiki)

**Week 3-4: Infrastructure Setup**
- ✅ AWS account setup (production, staging)
- ✅ Terraform configuration (VPC, RDS, S3, ECS)
- ✅ Deploy staging environment
- ✅ Database schema design (initial entities: Office, User, Case, Document)
- ✅ Authentication scaffold (JWT, user registration/login)

**Week 5-6: Foundation Code**
- ✅ Backend API scaffold (.NET Core project structure)
- ✅ Frontend scaffold (React + Vite + TypeScript)
- ✅ Database migrations setup (Entity Framework migrations / Flyway)
- ✅ Basic CRUD endpoints (Users, Offices)
- ✅ Frontend routing (React Router)
- ✅ UI component library integration (Ant Design / Shadcn)

**Week 7-8: Team Onboarding**
- ✅ Dev team recruited (2 backend, 2 frontend, 1 DevOps/Full-stack)
- ✅ Knowledge transfer (architecture, product requirements)
- ✅ First sprint planning (Agile, 2-week sprints)

**Deliverable:** Development environment funcțional, empty shell app deployed pe staging.

---

## 8.3. Phase 1: MVP Core Features (Luni 3-6)

### Obiective

**MVP = Minimum Viable Product pentru pilot cu 3-5 birouri notariale.**

**Core features:**
- Gestiune dosare (lifecycle complet)
- Upload/management documente
- Clienți (Persoane Fizice/Juridice, basic KYC)
- Repertoriu Notarial
- Utilizatori & permisiuni (RBAC)

### Sprint 1-2 (Luni 3): Case Management Foundation

**Backend:**
- ✅ Entități: Case, CaseParty, Person, Company
- ✅ API endpoints:
  - `POST /api/v1/cases` (create)
  - `GET /api/v1/cases` (list cu pagination, filters)
  - `GET /api/v1/cases/{id}` (detalii)
  - `PATCH /api/v1/cases/{id}` (update)
  - `DELETE /api/v1/cases/{id}` (soft delete)
- ✅ Business logic: Case status transitions, validation

**Frontend:**
- ✅ Dashboard (statistici simple: total cases, by status)
- ✅ Case list (tabel cu search, filters, sort)
- ✅ Case detail page (view toate datele)
- ✅ Create case form (multi-step: tip act → părți → detalii)

**Testing:**
- Unit tests (backend services, 70% coverage target)
- E2E test: Create case flow (Playwright)

---

### Sprint 3-4 (Lună 4): Document Management

**Backend:**
- ✅ Entitate: Document
- ✅ S3 integration (upload, download, versioning)
- ✅ API endpoints:
  - `POST /api/v1/documents/upload` (multipart/form-data)
  - `GET /api/v1/documents/{id}/download`
  - `GET /api/v1/cases/{id}/documents` (list documents per case)
  - `DELETE /api/v1/documents/{id}`
- ✅ File type validation (PDF, DOCX, JPG, PNG)
- ✅ Virus scanning (ClamAV integration - optional pentru MVP)

**Frontend:**
- ✅ Document upload (drag & drop, progress bar)
- ✅ Document list (per case, cu preview icons)
- ✅ Document preview (PDF.js pentru PDF-uri)
- ✅ Download, delete actions

---

### Sprint 5-6 (Lună 5): Clients & KYC

**Backend:**
- ✅ Entități: Person, Company, CompanyRepresentative
- ✅ API endpoints pentru CRUD clienți
- ✅ CNP validation (algorithm)
- ✅ CUI validation + ANAF API integration (verificare validitate firmă)
- ✅ KYC workflow (status: pending → verified → rejected)

**Frontend:**
- ✅ Client management (list, search, create, edit)
- ✅ Client detail page (dosare asociate, documente)
- ✅ ANAF integration UI (button "Verifică ANAF" → auto-populate date firmă)
- ✅ KYC status indicators (badges: ✅ Verified, ⏳ Pending)

---

### Sprint 7-8 (Lună 6): Repertory & Multi-Tenancy

**Backend:**
- ✅ Entitate: RepertoryEntry
- ✅ API endpoints repertoriu
- ✅ Business logic: Auto-increment repertory number (per office per year)
- ✅ Validation: Continuitate numere, kronologie
- ✅ Multi-tenancy enforcement: RLS (Row-Level Security) PostgreSQL

**Frontend:**
- ✅ Repertoriu view (tabel cronologic, search, export CSV)
- ✅ Creare entry repertoriu (manual sau trigger automat la case status "Signed")
- ✅ Validation errors display (dacă lipsește nr., dacă date necoerente)

**Testing:**
- Integration tests: Multi-tenant isolation (Office A cannot see Office B data)
- Performance test: 1000 cases, 10 concurrent users

**Deliverable:** **MVP funcțional** → Deploy pe staging, demo către 3 birouri pilot.

---

## 8.4. Phase 2: Extended Features (Luni 7-10)

### Obiective

**Feedback din pilot → Refinement + New features pentru production readiness.**

**Focus:**
- Task management & workflow
- Scheduling & calendar
- Facturare & accounting
- E-signature integration (QES)

---

### Sprint 9-10 (Lună 7): Task Management

**Backend:**
- ✅ Entitate: Task
- ✅ API endpoints tasks (CRUD, assign, status update)
- ✅ Task templates (per case type)
- ✅ Auto-generation tasks (trigger on case creation)

**Frontend:**
- ✅ Task dashboard (My Tasks, Kanban board)
- ✅ Task detail (checklist, comments, attachments)
- ✅ Notificări task (reminder deadline, overdue alerts)

---

### Sprint 11-12 (Lună 8): Scheduling & Calendar

**Backend:**
- ✅ Entitate: Appointment, RoomResource
- ✅ API endpoints appointments (CRUD, conflict detection)
- ✅ Background job: Reminder e-mail/SMS cu 24h înainte

**Frontend:**
- ✅ Calendar view (zi, săptămână, lună)
- ✅ Drag & drop programări
- ✅ Conflict detection UI (warning dacă notar/sală ocupat)
- ✅ Integration cu Task calendar view

---

### Sprint 13-14 (Lună 9): Billing & Accounting

**Backend:**
- ✅ Entități: Invoice, Payment
- ✅ Motor calcul onorar (OUG 119/2022 - tarife progresive)
- ✅ API endpoints invoices, payments
- ✅ PDF generation (factură template + variabile)

**Frontend:**
- ✅ Facturare workflow (draft → emis → plătit)
- ✅ Invoice preview (PDF în browser)
- ✅ Înregistrare plăți (cash, transfer, parțial)
- ✅ Rapoarte: Încasări, clienți restanți

---

### Sprint 15-16 (Lună 10): E-Signature Integration (QES)

**Backend:**
- ✅ Entitate: Signature
- ✅ Integration Certinomis/Namirial API (remote signing)
- ✅ Webhook handling (signer signed, session completed)
- ✅ Signature validation (OCSP check)

**Frontend:**
- ✅ Signing workflow UI (select signers, send invitations)
- ✅ Signing dashboard (status tracking: pending, signed, rejected)
- ✅ Document preview cu signature blocks

**Testing:**
- E2E test: Full signing flow (mock TSP responses)

**Deliverable:** **V0.8 Beta** → Extended pilot cu 10 birouri, collect feedback.

---

## 8.5. Phase 3: Advanced Features (Luni 11-14)

### Obiective

**Production-grade features + Special workflows + Compliance completă.**

**Focus:**
- Conflict of Interest detection
- Successions workflow
- Power of Attorney registry
- Compliance & audit trails
- External integrations (ONRC, RAR, ANCPI)

---

### Sprint 17-18 (Lună 11): Conflict Detection & Mentions

**Backend:**
- ✅ Entități: ConflictOfInterest, Mention
- ✅ Algorithm conflict detection (run on case party add)
- ✅ API endpoints conflicts, mentions
- ✅ Business logic: Resolution workflow (accepted/refused)

**Frontend:**
- ✅ Conflict alerts (pop-up când detectat)
- ✅ Conflict management UI (accept cu consimțământ, refuz)
- ✅ Mentions pe repertoriu (add, view history)

---

### Sprint 19-20 (Lună 12): Successions Workflow

**Backend:**
- ✅ Entități: Succession, Heir, Asset
- ✅ Multi-phase workflow (inventory → heirs → acceptance → partition)
- ✅ API endpoints successions (special CRUD)

**Frontend:**
- ✅ Succession case UI (timeline workflow stages)
- ✅ Heirs management (add, relationship, inheritance share)
- ✅ Assets inventory (immobile, mobile, conturi bancare)

---

### Sprint 21-22 (Lună 13): PowerOfAttorney Registry & External Integrations

**Backend:**
- ✅ Entitate: PowerOfAttorney
- ✅ Registry cu expiry tracking (job automat detectează expirate)
- ✅ Integrations: ONRC (Recom.ro), RAR (CarVertical)
- ✅ API wrappers pentru servicii externe (with caching)

**Frontend:**
- ✅ PowerOfAttorney registry view (search, filter by status)
- ✅ Integration UI (buttons "Verifică ONRC", "Verifică RAR")
- ✅ Display rezultate verificări (badge-uri, alerts)

---

### Sprint 23-24 (Lună 14): Compliance & Audit

**Backend:**
- ✅ Entitate: ActivityLog (comprehensive audit trail)
- ✅ Trigger-based logging (toate acțiunile critice)
- ✅ GDPR implementation: Data export, deletion workflow
- ✅ Anonymization job (scheduled, pentru dosare > 30 ani)

**Frontend:**
- ✅ Audit log view (admin only, search, filters)
- ✅ GDPR client requests UI (export date, evaluare ștergere)
- ✅ Compliance dashboard (KPI-uri: repertoriu compliance, GDPR requests stats)

**Testing:**
- Security audit: Penetration test (extern firm - Q4)
- GDPR compliance review (legal team + DPO)

**Deliverable:** **V1.0 Release Candidate** → Feature complete, testing intens.

---

## 8.6. Phase 4: Polish & Launch (Luni 15-18)

### Obiective

**Bug fixes, performance optimization, documentation, marketing, go-to-market.**

---

### Sprint 25-26 (Lună 15): Bug Fixes & Performance

**Activities:**
- 🐛 Bug bash (toată echipa testează, raportează bugs)
- ⚡ Performance optimization:
  - Database query optimization (indexes, query analysis)
  - Frontend bundle size reduction (code splitting, lazy loading)
  - Image optimization (WebP, responsive images)
- 📊 Load testing (JMeter: 100 concurrent users, 1000 req/min)

---

### Sprint 27-28 (Lună 16): Documentation & Training

**Activities:**
- 📖 User documentation:
  - User manual (PDF + online knowledge base)
  - Video tutorials (YouTube: "Cum creez un dosar?", "Cum generez un act?")
  - FAQ
- 👨‍💻 Developer documentation:
  - API documentation (Swagger/OpenAPI auto-generated)
  - Architecture diagrams (updated)
  - Deployment guide (on-premise)
- 🎓 Training materials:
  - Webinar pentru notari (demo live features)
  - Training pentru asistenți (hands-on workshop)

---

### Sprint 29-30 (Lună 17): Marketing & Sales Prep

**Activities:**
- 🌐 Website (lexnotar.ro):
  - Landing page (tagline: "Acte corecte. Flux eficient.")
  - Features page
  - Pricing page
  - Contact form / Demo request
- 📱 Social media setup (LinkedIn, Facebook - target notari)
- 📧 E-mail marketing:
  - Newsletter setup (Mailchimp)
  - Drip campaign pentru leads
- 🤝 Partnerships:
  - Camera Notarilor (pitch colaborare oficială)
  - QES providers (Certinomis, Namirial - partnership agreements)
- 💰 Pricing finalization (beta customers feedback)

---

### Sprint 31-32 (Lună 18): Launch Preparation & Go-Live

**Week 1-2:**
- ✅ Production environment final setup (AWS production account)
- ✅ Security review (final penetration test, compliance checklist)
- ✅ Data migration scripts (pentru beta customers: migrate staging → production)
- ✅ Monitoring & alerting setup (Prometheus, Grafana, PagerDuty)

**Week 3:**
- 🚀 Soft launch (beta customers switch to production)
- 📞 Support team ready (2 support agents, response time SLA defined)
- 📊 Monitor metrics (error rate, performance, user feedback)

**Week 4:**
- 🎉 **Public Launch** (announce pe LinkedIn, Camera Notarilor newsletter)
- 📰 Press release (publicații juridice, IT)
- 🎁 Launch promotion (50% discount primele 3 luni pentru early adopters)

**Deliverable:** **LexNotar V1.0 Production Live!** 🎊

---

## 8.7. Post-Launch Roadmap (Luni 19+)

### V1.1 - V1.3 (Luni 19-24): Iterations Based on Feedback

**Focus:**
- Bug fixes din production
- Minor features requested by users
- Performance optimizations
- Support integration requests (ex: client vrea integration cu soft contabilitate specific)

---

### V2.0 (Anul 2): Major Features

**Portal Client (Self-Service)**
- Client login (view dosare, documente)
- Programare online (calendar public)
- Upload documente (direct în dosar)
- Plăți online (card/PayPal integration)

**Mobile App (iOS/Android)**
- View dosare, documente
- Notifications push
- Semnare QES din mobile
- Programări (mobile calendar)

**Advanced Analytics & BI**
- Dashboard advanced (Metabase, Tableau integration)
- Custom reports builder
- Predictive analytics (ex: forecast încasări luna următoare)

**AI Features**
- OCR automat pentru documente uploadate
- Document classification (auto-detect tip document)
- NLP pentru search full-text inteligent
- Chatbot support (FAQ automated)

**Internationalization**
- Multi-language (English, Hungarian)
- Support pentru alte țări EU (adaptation regulamente locale)

---

## 8.8. Team & Resource Planning

### Phase 0-1 (Luni 1-6): Core Team

**Roles:**
- **1× Tech Lead / Architect** (full-time)
- **2× Backend Developers** (.NET Core, full-time)
- **2× Frontend Developers** (React, full-time)
- **1× DevOps Engineer** (part-time, 50%)
- **1× Product Manager** (full-time)
- **1× UX/UI Designer** (part-time, 50%)
- **1× QA Engineer** (full-time, starts Sprint 3)

**Total FTE:** ~7.5 full-time equivalents

---

### Phase 2-3 (Luni 7-14): Extended Team

**Add:**
- **+1 Backend Developer** (pentru integrations complexity)
- **+1 QA Engineer** (testing load increase)
- **1× Legal/Compliance Consultant** (part-time, pentru GDPR review)

**Total FTE:** ~10 full-time equivalents

---

### Phase 4 (Luni 15-18): Launch Team

**Add:**
- **2× Support Engineers** (pentru post-launch support)
- **1× Marketing Manager** (full-time)
- **1× Sales Representative** (full-time)

**Total FTE:** ~14 full-time equivalents

---

### Budget Estimate (Total, MVP → V1.0 Launch)

**Development (18 months):**
- Salaries (average €3,500/month per FTE, 10 FTE average): €630,000
- Infrastructure (AWS staging + production): €15,000
- Software licenses (IDEs, tools, QES provider): €10,000
- Legal/Compliance consulting: €20,000
- Marketing (website, ads, events): €30,000
- Miscellaneous (office, travel, etc.): €20,000

**Total:** ~€725,000 (pentru 18 luni, full team, production launch)

**Funding options:**
- Seed investment (€750k - €1M pentru 18-24 months runway)
- Bootstrap (dacă founders au capital)
- Grants (EU Horizon, national innovation grants)

---

## 8.9. Risk Management

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **QES integration complexity** | Medium | High | Start early (Sprint 15), pilot cu 1 provider, buffer time |
| **Performance issues (scale)** | Medium | High | Load testing early, horizontal scaling strategy ready |
| **Database migration issues** | Low | Medium | Staging env testing, rollback plan, backup before migration |
| **Third-party API downtime** (ANAF, ONRC) | Medium | Medium | Caching, fallback (manual input), retry logic |

---

### Business Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Low adoption (notari reticenți la digital)** | Medium | High | Pilot program, hands-on training, partnership cu Camera Notarilor |
| **Competitor launches similar product** | Medium | Medium | Speed to market (MVP rapid), differentiation (compliance focus, RO-specific) |
| **Regulatory changes** (new laws) | Low | Medium | Legal consultant on retainer, agile architecture (easy to adapt) |
| **Funding runs out** | Low | High | Milestone-based funding, revenue from beta customers, cost control |

---

### Legal/Compliance Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **GDPR violation** | Low | Critical | DPO (Data Protection Officer), compliance audit pre-launch, lawyer review |
| **Data breach** | Low | Critical | Security best practices, penetration testing, insurance (cyber liability) |
| **QES signatures invalidated** | Low | High | Use certified TSPs only (Certinomis, Namirial), LTV implementation |

---

## 8.10. Success Metrics (KPIs)

### Phase 1 (MVP): Pilot Program

**Targets (End of Month 6):**
- ✅ 3-5 birouri notariale active în pilot
- ✅ 100+ dosare create în sistem
- ✅ 500+ documente uploadate
- ✅ 20+ acte semnate (QES sau fizic)
- ✅ 0 critical bugs în production (severity P0)
- ✅ System uptime > 99% (staging environment)

---

### Phase 4 (Launch): Public Availability

**Targets (End of Month 18):**
- 🎯 **20-30 birouri notariale** plătitoare (subscription activ)
- 🎯 **MRR (Monthly Recurring Revenue): €10,000 - €15,000**
  - (20 offices × €500/month average)
- 🎯 **1,000+ dosare active** în sistem
- 🎯 **5,000+ documente** gestionate
- 🎯 **200+ acte semnate QES**
- 🎯 **System uptime: 99.5%** (SLA commitment)
- 🎯 **Customer satisfaction: > 4.0/5.0** (NPS survey)
- 🎯 **Support response time: < 4h** (business hours)

---

### Year 2 (Growth): Scale

**Targets (End of Month 30):**
- 🚀 **100+ birouri notariale**
- 🚀 **MRR: €50,000+**
- 🚀 **10,000+ dosare**
- 🚀 **Break-even** (revenue > costs)
- 🚀 **Team: 20 FTE** (support, sales, dev continues)
- 🚀 **V2.0 launched** (Portal Client, Mobile App)

---

## 8.11. Launch Checklist

### Pre-Launch (Month 17)

**Technical:**
- [ ] Production environment deployed & tested
- [ ] Database migration scripts validated (staging → production)
- [ ] Backup & restore tested (DR drill)
- [ ] Monitoring & alerting configured (Prometheus, Grafana, PagerDuty)
- [ ] Load testing completed (100 concurrent users, no issues)
- [ ] Security scan completed (OWASP ZAP, no critical vulnerabilities)
- [ ] SSL certificate installed (lexnotar.ro)
- [ ] DNS configured (Route 53 → ALB)

**Compliance:**
- [ ] GDPR compliance audit completed (legal team sign-off)
- [ ] DPA (Data Processing Agreement) templates ready (pentru clienți)
- [ ] Terms of Service & Privacy Policy published
- [ ] Cookie consent banner implemented (GDPR)

**Documentation:**
- [ ] User manual published (knowledge base)
- [ ] Video tutorials uploaded (YouTube channel)
- [ ] API documentation available (Swagger UI)
- [ ] Deployment guide for on-premise (PDF)

**Business:**
- [ ] Pricing finalized & published (website)
- [ ] Payment processor integrated (Stripe/PayPal)
- [ ] Support ticketing system ready (Freshdesk/Zendesk)
- [ ] Support team trained (2 agents)
- [ ] Marketing materials ready (landing page, brochures, pitch deck)

---

### Launch Day (Month 18, Week 4)

**Morning (09:00):**
- [ ] Final smoke tests (production environment)
- [ ] DNS cutover (if needed, point lexnotar.ro → production)
- [ ] Announce internally (team celebration! 🎉)

**Noon (12:00):**
- [ ] Public announcement (LinkedIn post, website live)
- [ ] E-mail blast către leads (500+ contacts din conferences, events)
- [ ] Press release sent (10 publicații juridice/IT)

**Afternoon (15:00):**
- [ ] Monitor metrics (error rate, traffic, sign-ups)
- [ ] Support team on standby (handle influx questions)

**Evening (18:00):**
- [ ] Daily standup (team review day, any issues?)
- [ ] Celebrate! 🍾 (team dinner)

---

### Post-Launch (Week 1-4)

**Week 1:**
- [ ] Monitor system stability (uptime, errors)
- [ ] Daily check-ins cu early customers (feedback calls)
- [ ] Bug triage & hotfixes (critical issues < 24h)

**Week 2:**
- [ ] Collect user feedback (survey, NPS)
- [ ] Plan V1.1 (prioritize top 5 requested features)

**Week 3:**
- [ ] Marketing push (LinkedIn ads, Google Ads campaign)
- [ ] Webinar demo (invite 50+ prospects)

**Week 4:**
- [ ] Sprint planning V1.1 (incorporate feedback)
- [ ] Review KPIs vs. targets (adjust strategy if needed)

---

## 8.12. Long-Term Vision (3-5 Years)

**Year 3-5 Objectives:**
- 🌍 **Expand to EU markets** (adapt pentru civil law notaries în Italia, Spania, Franța)
- 🏢 **Enterprise tier** (500+ user offices, custom integrations, dedicated infrastructure)
- 🤖 **AI-powered features** (act generation automat din voice input, predictive compliance)
- 🔗 **Blockchain integration** (pentru tamper-proof document registry, experimental)
- 💼 **Adjacent verticals** (avocați, executori, instanțe - similar workflow needs)
- 📈 **Exit options** (acquisition by LegalTech major sau IPO if scale achieved)

---

**🎯 Final Note:**

Acest roadmap este **realist dar ambițios**. Presupune:
- **Team dedicat, competent**
- **Funding suficient** (€750k - €1M pentru 18 luni)
- **Product-market fit validat** (pilot program confirma need)
- **Execution disciplinată** (Agile, sprints de 2 săptămâni, daily standups)

**Flexibility:** Roadmap-ul va evolua based on feedback, market changes, technical discoveries. Key = **iterație rapidă** și **focus pe value delivery pentru notari**.

---

**[🏁 Blueprint Complete!](../PRODUCT_BLUEPRINT.md)**
