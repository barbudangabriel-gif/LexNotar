# 1. Product Vision & Positioning

[← Înapoi la Cuprins](../PRODUCT_BLUEPRINT.md)

---

## 1.1 Viziunea LexNotar

LexNotar este platforma centrală de management pentru biroul notarial modern din România și UE, care transformă munca administrativă dispersată într-un flux unificat, securizat și conform. Viziunea este ca orice birou notarial – de la practician solo cu un asistent, până la birouri mari cu multipli notari – să poată gestiona complet ciclul de viață al fiecărui dosar (de la intake-ul clientului până la arhivarea actului semnat și facturarea finalizată) dintr-o singură interfață, cu conformitate GDPR și eIDAS by-design, eliminând munca duplicată, riscurile umane și pierderea de timp pe sarcini repetitive.

**Obiectiv central:** LexNotar devine „sistemul nervos central" al biroului notarial - toate informațiile, toate procesele, toate conformitățile, într-un singur sistem integrat.

---

## 1.2 Target Market

### Segmente Principale

#### **Birouri Mici (1 notar + 1-2 asistenți)**
- **Caracteristici:**
  - 100-300 dosare/an
  - Lucrează preponderent cu clienți locali
  - Workflow-uri simple, fără separare strictă de responsabilități
  - Buget limitat pentru software
  
- **Nevoi specifice:**
  - Soluție accesibilă ca preț (SaaS cu abonament mic sau one-time payment pentru on-prem)
  - Ușor de învățat și implementat (onboarding rapid, < 1 săptămână)
  - Să înlocuiască Excel-uri, Word-uri, folder-e pe desktop
  - Suport pentru un singur utilizator în paralel (notar + asistent lucrează împreună)
  
- **Propunere de valoare LexNotar:**
  - "Implementezi în 3 zile, lucrezi profesional din ziua 4"
  - Toate feature-urile esențiale la preț accesibil
  - Conformitate GDPR și repertoriu notarial out-of-the-box

---

#### **Birouri Medii (2-5 notari, 5-10 asistenți)**
- **Caracteristici:**
  - 500-1500 dosare/an
  - Echipă mai structurată: fiecare notar cu asistenți dedicați
  - Mix clienți: particulari + firme (PJ)
  - Nevoi de raportare și separare dosare per notar
  
- **Nevoi specifice:**
  - Multi-user access cu separare clară între dosarele notarilor (ownership)
  - Calendar shared pentru evitare suprapuneri întâlniri
  - Rapoarte pe notar (venituri, productivitate)
  - Integrare cu sisteme externe (ANAF, ONRC pentru verificare PJ)
  
- **Propunere de valoare LexNotar:**
  - "Scalabilitate fără compromis: de la 2 la 10 notari fără schimbare de sistem"
  - RBAC granular: fiecare utilizator vede doar ce trebuie
  - Rapoarte consolidate pentru management + detaliate per notar

---

#### **Birouri Mari (5-10+ notari, 15-30+ asistenți)**
- **Caracteristici:**
  - 2000+ dosare/an
  - Multiple locații (sedii în orașe diferite)
  - Departamentalizare: echipă contabilitate, IT intern, administrator dedicat
  - Clienți corporate (contracte volum, SLA-uri)
  
- **Nevoi specifice:**
  - Multi-office support cu izolare sau partajare configurabilă
  - Performance la volume mari (concurență 50+ useri activi)
  - Integrări avansate (API pentru clienți corporate, export pentru ERP extern)
  - Compliance audit-ready (GDPR, ANSPDCP, controale UNNPR)
  - On-prem option pentru control complet date
  
- **Propunere de valoare LexNotar:**
  - "Enterprise-grade infrastructure, costuri SaaS transparente"
  - Deployment flexibil: SaaS multi-tenant sau on-prem dedicat
  - API public pentru integrări custom
  - SLA garantat + suport prioritar

---

### Segmente Secundare (Roadmap V2+)

#### **Asociații/Rețele de Notari**
- 10-50 birouri independente care colaborează
- Partajare template-uri, best practices
- Raportare consolidată la nivel rețea
- Marketplace template-uri și integrări

#### **Notari Mobili/Deplasări Frecvente**
- Notari care lucrează preponderent la domiciliul clienților
- Nevoi: mobile app full-featured, mode offline, tracking cheltuieli deplasare
- LexNotar oferă: aplicație iOS/Android cu sync cloud

---

## 1.3 Poziționare: Ce Face LexNotar Diferit

### Față de CRM Generic (ex: HubSpot, Salesforce)

| Aspect | CRM Generic | LexNotar |
|--------|-------------|----------|
| **Entitate centrală** | Lead/Contact | **Dosar Notarial** cu lifecycle specific |
| **Conformitate** | Generic (GDPR basic) | **eIDAS (QES), Repertoriu Notarial, Arhivă 30 ani** |
| **Workflow-uri** | Sales pipeline generic | **Workflow notarial** (Draft → Signed → Arhivat) |
| **Documente** | Attachment generic | **Template-uri acte, generare automată, minute vs copii** |
| **Billing** | Invoice generic | **Calcul onorarii conform OUG 119/2022, taxe notariale** |
| **Părți implicate** | Contact generic | **Părți cu roluri juridice** (vânzător, cumpărător, moștenitor) + obiecte (imobil cu cadastral) |

**Concluzie:** Un CRM generic necesită customizări masive (luni de work) pentru a deveni funcțional într-un context notarial. LexNotar e built pentru notariat din ziua 1.

---

### Față de Sisteme de Programări Online (ex: Calendly, Acuity)

| Aspect | Calendly | LexNotar |
|--------|----------|----------|
| **Scopul principal** | Programare întâlniri | **Management complet dosar** (programarea e doar o componentă) |
| **Workflow post-programare** | Inexistent | **Dosar creat automat** la programare, checklist, documente, facturare |
| **Integrări** | Google Calendar, Zoom | **QES, ANAF, ONRC, registre notariale** |
| **Conformitate** | Basic | **GDPR + eIDAS + Legislație notarială RO** |

**Concluzie:** Sistemele de programări rezolvă doar 5% din nevoile unui birou notarial. LexNotar rezolvă 100%.

---

### Față de Software Notarial Existent (Competitori Direcți)

**Competitori identificați:**
- Software-uri notariale românești (unele vechi, desktop-only)
- Soluții internaționale adaptate superficial pentru RO (ex: NotaryAssist, Notarize - orientate pe "mobile notary" US)

**Diferențierea LexNotar:**

#### **1. Arhitectură Modernă**
- **Competitori:** Multe soluții vechi = desktop apps (Windows-only), DB local, backup manual
- **LexNotar:** Web-based (accesibil oriunde), SaaS cu backup automat + on-prem option

#### **2. UX/UI Modern**
- **Competitori:** Interfețe învechite, greu de învățat
- **LexNotar:** UI modern (React/Vue), intuitive, mobile-responsive

#### **3. Conformitate Proactivă**
- **Competitori:** Conformitate GDPR/eIDAS ca "addon" sau implementată superficial
- **LexNotar:** Compliance **by design** - DPIA făcut, audit log imutabil, repertoriu obligatoriu din MVP

#### **4. Integrări Native**
- **Competitori:** Import/export manual (Excel, CSV)
- **LexNotar:** API-first architecture - integrări native cu ANAF, ONRC, QES providers, eventual iNot

#### **5. Transparență Preț**
- **Competitori:** Prețuri negociate case-by-case, licențe perpetuale scumpe
- **LexNotar SaaS:** Pricing transparent pe website:
  - **Starter** (1-2 notari): 99 EUR/lună
  - **Professional** (3-10 notari): 249 EUR/lună
  - **Enterprise** (10+ notari): custom
  - **On-prem:** One-time license + suport anual

#### **6. Extensibilitate & Roadmap Public**
- **Competitori:** Roadmap opac, feature requests ignorate
- **LexNotar:** Roadmap public (GitHub), community feedback, API public pentru integrări custom

---

## 1.4 Value Proposition (Elevator Pitch)

**Pentru birouri mici:**
> "LexNotar este sistemul complet de management pentru biroul tău notarial. În 3 zile implementezi, în 7 zile abandonezi Excel-urile. Toate dosarele, toate documentele, toate facturile - într-un singur loc, conform GDPR și cu repertoriu notarial automat. 99 EUR/lună, fără costuri ascunse."

**Pentru birouri medii/mari:**
> "LexNotar este singura platformă notarială enterprise-grade construită pentru scalare: de la 2 la 50 de notari fără migrare de sistem. Multi-office, multi-user, integrări native cu ANAF/ONRC/QES, API public, conformitate audit-ready. SaaS sau on-prem, tu alegi."

**Pentru notari techies/early adopters:**
> "LexNotar este first modern, API-first notary platform pentru civil law. Open roadmap, arhitectură modulară, deployment Docker/Kubernetes, integrări prin REST API. Built for 2025+, not 2005."

---

## 1.5 Success Metrics (KPI-uri Post-Launch)

### Product-Market Fit
- **Primary:** 50 birouri active (paying) în primul an
- **Secondary:** NPS (Net Promoter Score) > 50

### Usage Metrics
- **Dosare create/lună per birou:** Target avg 100+ (indicator că e folosit zilnic, nu abandonat)
- **Retention rate:** > 90% la 12 luni (birouri care nu cancelează)
- **Feature adoption:** 
  - Repertoriu folosit: 100% (obligatoriu)
  - Document generation: > 80%
  - QES integration: > 50% (V1+)

### Business Metrics
- **MRR (Monthly Recurring Revenue):** 10k EUR la 12 luni (avg 200 EUR/birou × 50 birouri)
- **CAC (Customer Acquisition Cost):** < 1000 EUR/birou
- **LTV/CAC ratio:** > 3:1

---

**[Next: User Personas & Key Use Cases →](./02-user-personas.md)**
