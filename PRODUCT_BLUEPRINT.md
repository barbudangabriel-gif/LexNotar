# LexNotar - Product Blueprint

**Tagline:** „Acte corecte. Flux eficient."

**Versiune:** 1.0  
**Data:** Noiembrie 2025  
**Status:** Architecture & Design Complete

---

## Cuprins

### Secțiuni Principale

1. **[Product Vision & Positioning](./docs/01-vision-and-positioning.md)**
   - Viziunea LexNotar
   - Target market și tipuri de birouri
   - Diferențiere față de competiție

2. **[User Personas & Key Use Cases](./docs/02-user-personas.md)**
   - Notar (Maria, 45 ani)
   - Asistent/Secretară (Andreea, 28 ani)
   - Contabil (Ion, 52 ani)
   - Administrator Birou (Alexandru, 38 ani)

3. **[Functional Modules – Full Feature Map](./docs/03-functional-modules.md)**
   - Core Case Management (cu Repertoriu Notarial)
   - CRM & Client Management
   - Document Automation
   - Scheduling & Calendar
   - Tasks & Workflow
   - Billing, Fees & Accounting
   - Compliance & Risk
   - E-signature & Remote Notarization
   - Client Portal (roadmap)
   - Integrations

4. **[Non-Functional Requirements](./docs/04-non-functional-requirements.md)**
   - Scalabilitate (multi-tenant, multi-office)
   - Securitate (RBAC, criptare, 2FA)
   - Logging, Monitoring, Backup & DR
   - GDPR (DPIA, DPO, data retention)
   - Performanță

5. **[Data Model (Conceptual)](./docs/05-data-model.md)**
   - Entități Core (Tenant, Office, User, Role)
   - Entități CRM (Client, ClientDocument)
   - Entități Case Management (Case, CaseParty, CaseObject, ChecklistItem, Document)
   - Entități Document Automation (Template, GeneratedDocument)
   - Entități Scheduling (Appointment, RoomResource, Task)
   - Entități Billing (FeeSchedule, Invoice, Payment)
   - Entități E-signature (SignatureRequest, SignatureParty)
   - Entități Compliance (AuditLog, DocumentAccessLog, GDPRRequest)
   - **Entități Specifice Notariat RO:**
     - Repertory (Repertoriu Notarial - OBLIGATORIU)
     - Mention (Mențiuni pe acte)
     - Heir (Moștenitori pentru succesiuni)
     - Asset (Bunuri din moștenire)
     - PowerOfAttorney (Registru procuri)
     - ConflictOfInterest (Verificare conflicte)
     - CopyIssuance (Eliberare copii legalizate)
     - CaseRelationship (Relații între dosare)

6. **[System Architecture (High-Level)](./docs/06-system-architecture.md)**
   - Architectural layers (Presentation, API, Domain, Data, Integration)
   - Technology stack options
   - Deployment architecture (SaaS vs On-Prem)
   - Scalability & performance optimizations
   - Storage strategy & lifecycle

7. **[Security & Audit by Design](./docs/07-security-and-audit.md)**
   - RBAC granular (matrice permisiuni detaliate)
   - Politici acces la dosare (ownership, team-based)
   - Audit log complet (acțiuni sensibile)
   - Mecanisme anti-abuz (rate limiting, brute force protection)
   - Protecție date sensibile (encryption, masking)
   - Vulnerabilități comune (SQL injection, XSS, CSRF, IDOR)
   - Incident response plan

8. **[Release Roadmap (Phased)](./docs/08-release-roadmap.md)**
   - **MVP** (3-4 luni): Core essentials + Repertoriu
   - **V1** (2-3 luni după MVP): QES integration, multi-office, enhanced features
   - **V2+** (4-6 luni după V1): Client portal, ANAF/ONRC integrations, advanced analytics

---

### Anexe (Completări din Cercetare Aprofundată) ✅

9. **[Integrări Externe - Specificații Tehnice](./docs/annex-09-external-integrations.md)** ✅ **COMPLETE**
   - **ANAF API:** CUI verification (request/response JSON examples, C# implementation, caching 24h, rate limits 100 req/min)
   - **ONRC (Recom.ro):** Company data (full JSON responses, administratori, asociați, pricing €29-99/month)
   - **RAR via CarVertical:** Vehicle reports (VIN check, stolen status, liens, damage history, pricing €5-10/report)
   - **ANCPI ECRIS:** Carte Funciară (manual workflow + OCR parsing Tesseract, regex extraction CF number/owners/liens)
   - **QES Providers (Certinomis/Namirial):** Complete flows (create signing session POST /signing-sessions, webhook events: signer.signed/session.completed, download signed doc, pricing €2-5/signature)
   - **SendGrid:** Email templates (dynamic_template_data, pricing $19.95-89.95/month)
   - **Twilio:** SMS reminders (pricing ~$0.05/SMS Romania)
   - **BNR:** Currency rates (XML parsing, daily job 14:00, 30+ currencies)
   - **Integration health monitoring:** Dashboard with status/response time per service

10. **[Workflows Speciale - Procese Detaliate](./docs/annex-10-special-workflows.md)** ✅ **COMPLETE**
    - **Succesiune (Moștenire):** End-to-end (5 faze × 30+ steps: Intake & verificare deces → Inventory assets/debts cu ANAF/RAR/Bancă → Identificare moștenitori cu wizard calcul cote legale → Acceptare/Renunțare cu templates declarație → Împărțeală & Certificate cu calcul impozit succesoral ANAF, eliberare Certificate de Moștenitor, transcriere CF/RAR), edge cases (minor, dispărut, bunuri străinătate, testament substituție)
    - **Conflict of Interest:** Detection algorithm (4 types: notar = parte/rudă/mandatar comun/acte multiple aceleași părți, SQL queries, severity scoring), resolution workflow (consimțământ scris template, transfer dosar, refuz cu motivare, audit log)
    - **Procură (Power of Attorney):** Complete lifecycle (10 steps: intake client + mandatar KYC → verificare capacitate civilă + red flags elderly → selectare template special/general → completare formular cu variables → conflict check → citire în fața mandantului → semnare wet/QES → înregistrare Repertoriu + Registry → eliberare copii → apostilă for international use), monitoring expiry (email 30 days before), revocation process
    - **Vânzare-Cumpărare Imobil:** Complete 30-step process (10 faze majore: Intake & KYC părți → Verificare juridică CF ANCPI + ANAF fiscal + preempțiune coproprietari → Antecontract cu avans & penalități → Finanțare credit bancar cu evaluare → Documente finale CF actualizat + certificat energetic → Draft act 150+ variables + peer review → Plată taxe notariale OUG 119/2022 progresiv + OCPI → Semnare wet/QES cu citire act 15-30 min + transfer fonduri + Repertoriu entry → Transcriere CF la OCPI 3-10 zile → Ipotecă grad I + transfer credit bancă + evacuare vânzător + închidere dosar)

11. **[Conformitate Detaliată - Mapare Legală](./docs/annex-11-compliance-detail.md)** ✅ **COMPLETE**
    - **GDPR Compliance Matrix:** Articol-cu-articol (Art. 5 Principii: legalitate/minimizare/exactitate/limitare stocare/securitate cu implementations encryption AES-256/RLS/2FA/audit log, Art. 12-23 Drepturi: acces ZIP export/rectificare self-service/ștergere LIMITED cu justificare Legea 36/1995 vs GDPR art. 17(3)(b)/portabilitate JSON+CSV+PDF/obiecție marketing opt-out, Art. 24-43 Controller: Data Protection by Design/Registru activități procesare/Securitate art. 32 cu măsuri/Breach notification ANSPDCP 72h/DPIA pre-launch/DPO Year 6-12, Art. 44-50 Transfer EU-only AWS Frankfurt/Azure Amsterdam + DPA with SCC for SendGrid/Twilio)
    - **Legea 36/1995:** Capitolul IV Art. 89-102 mapping (Act autentic formă/conținut obligatoriu template validation/citire cu voce tare reminder UI/modificări pre-signature only/semnare părți+notar+martori workflow/păstrare arhivă 30 ani S3 lifecycle + anonymization job/eliberare copii legalizate with CopyIssuance tracking/refuz act workflow with reason dropdown), Capitolul III Art. 25-29 conflict detection algorithm
    - **eIDAS Regulament 910/2014:** QES requirements (Art. 25 QES = olograf via QTSP Certinomis/Namirial, Art. 32 Validare certificate issuer EU Trust List + OCSP revocation check + timestamp RFC 3161 + hash SHA-256, Art. 35 LTV Long-Term Validation embed OCSP response in PDF Adobe for 30-year validity, Art. 40 Răspundere QTSP contractual indemnification clauses)
    - **OUG 119/2022 Taxe:** Calcul automat C# function (Vânzare-cumpărare progresiv: 0-50k €500 fix, 50k-100k 1%, 100k-200k 0.5%, 200k-500k 0.3%, >500k 0.2%; Succesiune similar; Procură fix €50-300; Donație/Ipotecă progresiv; Autentificare semnături €10-20/each; Traduceri €15-25/pagină), Excepții art. 12 scutiri cu checkbox + upload justificativ, Reduceri multi-act 15% if 3+ same day
    - **ISO 27001 Roadmap:** Annex A control mapping (A.5 Organizational policies to do Year 2, A.8 Asset inventory + classification Restricted/Confidential/Internal/Public, A.9 Access control RBAC+RLS+2FA ready, A.10 Cryptography AES-256+TLS 1.3+KMS ready, A.12 Operations backup+logging ready, A.13 Communications network security ready, A.14 SDLC secure Git flow+OWASP ZAP+Dependabot ready, A.15 Supplier vendor assessment partial, A.16 Incident response playbook ready, A.17 BC/DR RTO 4h ready, A.18 Compliance audit Year 2-3 target certification €15-30k)
    - **Audit Checklist Pre-Launch:** 65 checkpoints (30 GDPR: Privacy Policy/Cookie banner/DPO contact/data export/rectification/deletion message/encryption/RLS/audit log/anonymization job/DPA signed/SCC/Registru/DPIA/breach template/2FA/password policy/session timeout/rate limiting/security headers/CORS/input validation/SQL injection/XSS/CSRF/pen test; 20 Legea 36/1995: Repertoriu/continuitate/templates/citire reminder/immutability/storage 30y/lifecycle/backup/copii feature/tracking/refuz workflow/conflict detection/resolution/capacitate check/CNP validation/ANAF/ONRC/QES integrations/signature validation/LTV; 10 eIDAS: QTSP integration/EU Trust List/OCSP/timestamp/LTV/hash verification/issuer/validity/UI badge/contract; 5 OUG 119/2022: calcul taxă tests/all act types/scutiri/discount/preview UI)
    - **Post-Launch Continuous Compliance:** Quarterly review (audit log sample 100 random, access review inactive users, incident review, vendor SLA monitoring), Annual review (DPIA update, penetration test €5-15k, ISO 27001 mock audit Year 2+, legal review new laws, cyber insurance €2-5k/year)

---

## Despre Blueprint

Acest blueprint a fost creat prin:
1. Definirea inițială a viziunii și feature-urilor (secțiuni 1-8)
2. **Cercetare aprofundată** pe:
   - Legislația notarială română (Legea 36/1995, OUG 119/2022)
   - Cerințe GDPR și eIDAS specifice contextului notarial
   - Fluxuri de lucru reale și edge cases complexe
   - Integrări critice cu sisteme externe (ANAF, ONRC, RAR)
   - Validare arhitectură tehnică la scară reală
3. Integrarea completărilor în anexele 9-11

**Rezultat:** Un blueprint production-ready, pragmatic, orientat pe implementare reală, nu marketing.

---

## Utilizare

Acest blueprint servește ca:
- **Specificație tehnică** pentru echipa de dezvoltare
- **Document de referință** pentru decizii de produs
- **Material de prezentare** către investitori/clienți potențiali
- **Ghid de conformitate** pentru legal/compliance team

---

**Creat de:** Product Architect & Legal-Tech Consultant (specializare notariat civil law EU/RO)  
**Contact:** [GitHub - barbudangabriel-gif](https://github.com/barbudangabriel-gif)
