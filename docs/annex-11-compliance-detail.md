# Annex 11: Compliance Detail - Legal & Regulatory Mapping

[← Înapoi la Blueprint](../PRODUCT_BLUEPRINT.md) | [← Previous](./annex-10-special-workflows.md)

---

## Obiectiv

Mapare articol-cu-articol a cerințelor legislative (GDPR, Legea 36/1995, eIDAS, OUG 119/2022) la features LexNotar.

---

## 11.1. GDPR (Regulamentul UE 2016/679) - Compliance Matrix

### 11.1.1. Capitolul II: Principii (Art. 5-11)

| Articol | Cerință GDPR | Implementare LexNotar | Status |
|---------|--------------|----------------------|--------|
| **Art. 5(1)(a)** | **Legalitate, echitate, transparență:** Date procesate legal, corect, transparent pentru subiect | - Privacy Policy publicată (accesibilă fără login)<br>- Cookie banner la prima vizită<br>- Informare clienți la primul contact (template email "Informare GDPR") | ✅ Ready |
| **Art. 5(1)(b)** | **Limitare scop:** Date colectate pentru scopuri determinate, explicite, legitime | - Data collection limited la: identitate (KYC), contact (programări), financiar (facturare)<br>- No tracking marketing fără consimțământ explicit | ✅ Ready |
| **Art. 5(1)(c)** | **Minimizarea datelor:** Doar datele necesare scopului | - Nu colectăm date demografice inutile (ex: etnie, religie)<br>- CNP colectat doar pentru identificare legală (obligație notarială) | ✅ Ready |
| **Art. 5(1)(d)** | **Exactitate:** Date corecte, actualizate | - Validare CNP (checksum algorithm)<br>- Validare CUI via ANAF API<br>- Clienți pot actualiza date contact (self-service portal) | ✅ Ready |
| **Art. 5(1)(e)** | **Limitare stocare:** Păstrare doar cât e necesar | - Arhivare automată după 30 ani (obligație legală notarială)<br>- Anonymization job după 30 ani (GDPR balance cu Legea 36/1995) | ✅ Ready |
| **Art. 5(1)(f)** | **Integritate, confidențialitate:** Securitate date (protecție împotriva pierdere, acces neautorizat) | - Encryption at rest (AES-256)<br>- Encryption in transit (TLS 1.3)<br>- Row-Level Security (PostgreSQL RLS)<br>- 2FA obligatoriu pentru useri<br>- Audit log immutabil | ✅ Ready |
| **Art. 5(2)** | **Responsabilitate:** Controller demostrează conformitatea | - Documentație conformitate (acest document)<br>- Audit logs 30 ani<br>- DPO disponibil (email: dpo@lexnotar.ro) | ✅ Ready |

---

### 11.1.2. Capitolul III: Drepturi Subiecți (Art. 12-23)

| Articol | Drept | Implementare LexNotar | Status |
|---------|-------|----------------------|--------|
| **Art. 13** | **Informare la colectare:** Informare subiect despre procesare (scop, bază legală, perioadă stocare, drepturi) | - Template email "Informare GDPR" trimis automat la first contact<br>- Content: scop (dosare notariale), bază legală (obligație legală notarială per Legea 36/1995), stocare 30 ani, drepturi (acces/rectificare/ștergere cu limite legale) | ✅ Ready |
| **Art. 15** | **Drept acces:** Subiect poate cere copie date personale | - Feature "Solicitare date personale" în Portal Client<br>- API endpoint: `POST /api/gdpr/access-request`<br>- Response: ZIP cu toate datele (JSON format + PDF documente)<br>- SLA: 30 zile (conform GDPR art. 12(3)) | ✅ Ready |
| **Art. 16** | **Drept rectificare:** Subiect poate corecta date incorecte | - Portal Client: Self-service edit (nume, adresă, telefon, email)<br>- Restricție: CNP nu poate fi editat (immutable, legal identifier)<br>- Notificare notar dacă client schimbă date cu impact legal | ✅ Ready |
| **Art. 17** | **Drept ștergere ("dreptul de a fi uitat"):** Ștergere date dacă nu mai sunt necesare | - **LIMITARE LEGALĂ:** Imposibil de aplicat complet (Legea 36/1995 art. 100: arhivă 30 ani obligatorie)<br>- Compromis: **Anonymization** după 30 ani (în loc de ștergere)<br>- Excepție GDPR art. 17(3)(b): "pentru respectarea unei obligații legale" (arhiva notarială = obligație legală)<br>- UI: Mesaj explicativ "Datele dvs. nu pot fi șterse complet din cauza obligațiilor legale de arhivare (Legea 36/1995), dar vor fi anonimizate după 30 ani." | ⚠️ Partial (cu justificare legală) |
| **Art. 18** | **Drept restricționare procesare:** Subiect poate cere oprire temporară procesare | - Feature "Obiecție procesare" în Portal Client<br>- Status: `Person.ProcessingRestricted = true`<br>- Effect: Datele rămân în BD (arhivă legală), dar nu mai sunt folosite pentru comunicări marketing/reminder-uri opționale<br>- Excepție: Procesare continuă pentru dosare în curs (obligație legală) | ✅ Ready |
| **Art. 20** | **Drept portabilitate:** Subiect primește date în format structurat, portabil | - Inclus în feature "Solicitare date personale" (art. 15)<br>- Format: JSON (machine-readable) + CSV (pentru conturi/facturi) + PDF (documente) | ✅ Ready |
| **Art. 21** | **Drept obiecție:** Subiect poate obiecta la procesare (dacă bază legală = interes legitim) | - **NU APLICABIL:** LexNotar procesează date pe bază legală "obligație legală" (Legea 36/1995), nu "interes legitim"<br>- Excepție: Marketing opt-out disponibil (unsubscribe link în email-uri) | ✅ N/A (cu marketing opt-out) |
| **Art. 22** | **Decizie automată:** Subiect poate obiecta la decizii bazate doar pe procesare automată | - **NU APLICABIL:** LexNotar nu ia decizii automate cu efect juridic semnificativ<br>- Toate actele notariale semnate de om (notar) | ✅ N/A |

---

### 11.1.3. Capitolul IV: Controller & Processor (Art. 24-43)

| Articol | Cerință | Implementare LexNotar | Status |
|---------|---------|----------------------|--------|
| **Art. 25** | **Data Protection by Design & by Default:** Măsuri tehnice/organizaționale din design pentru protecție date | - PostgreSQL RLS (izolare date per tenant)<br>- Encryption by default<br>- Pseudonimizare (internal ID, nu CNP expus în logs)<br>- Minimizare date (no unnecessary fields) | ✅ Ready |
| **Art. 30** | **Registru activități procesare:** Controller ține registru cu toate operațiunile de procesare | - Registru în format Excel/Notion:<br>  - Operațiune: "Gestiune dosare notariale"<br>  - Scop: "Îndeplinirea atribuțiilor notariale"<br>  - Categorii subiect: Clienți (persoane fizice/juridice)<br>  - Categorii date: Identitate, contact, financiar<br>  - Destinatari: ANAF, ONRC, QES providers (subprocesori)<br>  - Transfer terțe țări: NU<br>  - Termen ștergere: 30 ani (apoi anonymization)<br>  - Măsuri securitate: Encryption, RLS, 2FA, audit log | ✅ Ready |
| **Art. 32** | **Securitate procesare:** Măsuri tehnice/organizaționale pentru securitate | - Encryption at rest/transit<br>- Pseudonimizare<br>- Confidențialitate (RLS, RBAC)<br>- Integritate (audit log immutabil, checksums)<br>- Disponibilitate (HA deployment, backup daily)<br>- Resilience (DR plan, RTO 4h)<br>- Test securitate (penetration testing anual) | ✅ Ready |
| **Art. 33** | **Notificare breach la autoritate:** Notificare ANSPDCP în 72h dacă breach | - Process:<br>  1. Detection: Alerting via Prometheus/Grafana<br>  2. Incident Response Team activated<br>  3. Assess severity (personal data exposed?)<br>  4. If YES: Notify ANSPDCP (email: anspdcp@dataprotection.ro) în 72h<br>  5. Template email "Notificare breach GDPR" (pre-drafted)<br>  6. Include: nature breach, categorii date, nr. subiecți afectați, consecințe, măsuri luate | ✅ Process Ready |
| **Art. 34** | **Notificare breach la subiect:** Notificare subiecți dacă risc înalt | - Process:<br>  1. Assess risk: High? (ex: CNP-uri expuse → risc furt identitate)<br>  2. If YES: Email blast către subiecți afectați<br>  3. Template: "Ne pare rău, datele dvs. au fost compromise. Recomandări: schimbați parolele, monitorizați conturi bancare."<br>  4. Offer: Asistență gratuită (ex: monitoring credit 12 luni) | ✅ Process Ready |
| **Art. 35** | **DPIA (Data Protection Impact Assessment):** Evaluare impact dacă procesare cu risc înalt | - **Trigger:** LexNotar procesează date sensibile (juridice, financiare) la scară mare<br>- DPIA realizat în faza de design (acest document = partial DPIA)<br>- DPIA complet: Document separat (30-50 pagini)<br>  - Descriere procesare<br>  - Necesitate & proporționalitate<br>  - Riscuri subiect (confidențialitate, disponibilitate, integritate)<br>  - Măsuri mitigare (encryption, RLS, audit)<br>  - Consultare DPO<br>- Review DPIA: Anual sau la schimbări majore | ⚠️ To Do (pre-launch) |
| **Art. 37** | **DPO (Data Protection Officer):** Numire obligatorie pentru autorități publice sau procesare la scară mare | - **Status:** LexNotar = private company, dar procesare la scară mare → **Recomandabil** DPO<br>- Opțiuni:<br>  - **Opțiune A:** DPO intern (FTE, salariu €2-3k/month)<br>  - **Opțiune B:** DPO extern (consultant, €500-1000/month retainer)<br>- Contact: dpo@lexnotar.ro (mandatory publicat în Privacy Policy) | ⚠️ To Do (Month 6-12) |

---

### 11.1.4. Capitolul V: Transfer Date Terțe Țări (Art. 44-50)

| Articol | Cerință | Implementare LexNotar | Status |
|---------|---------|----------------------|--------|
| **Art. 44** | **Principiu general:** Transfer date în afara UE doar dacă țară asigură nivel adecvat protecție | - **LexNotar policy:** Data hosting ONLY în UE<br>  - AWS: eu-central-1 (Frankfurt, Germany)<br>  - Azure: West Europe (Amsterdam, Netherlands)<br>- No transfer to US/China/Russia<br>- Subprocesori: Verificare locație servere (ex: Certinomis = EU, SendGrid = contractual DPA cu Standard Contractual Clauses) | ✅ Ready |
| **Art. 46** | **Transfer cu garanții adecvate:** Dacă țară fără decizie adecvare, transfer cu Standard Contractual Clauses (SCC) | - **Subprocesori non-EU (dacă aplicabil):**<br>  - SendGrid (US-based, dar servere EU): **Data Processing Agreement (DPA)** semnat, include **EU Standard Contractual Clauses (SCC)**<br>  - Twilio (US-based): Similar DPA + SCC<br>- Documente DPA arhivate, disponibile ANSPDCP la cerere | ✅ Ready (DPA signed) |

---

## 11.2. Legea 36/1995 (Legea Notarilor Publici) - Compliance Matrix

### 11.2.1. Capitolul IV: Actul Notarial (Art. 89-102)

| Articol | Cerință | Implementare LexNotar | Status |
|---------|---------|----------------------|--------|
| **Art. 89** | **Formă act autentic:** Act autentificat de notar în prezența părților, cu semnătură și sigiliu notarial | - Document generation cu template standardizat<br>- Workflow: Draft → Review → Citire în fața părților → Semnare (wet sau QES)<br>- Sigiliu notarial: Digital watermark pe PDF (QES) sau sigiliu fizic (wet signature)<br>- Insert `Document.Type = 'AuthenticAct'` | ✅ Ready |
| **Art. 90** | **Conținut obligatoriu:** Act conține: data, locul, părți (identitate), obiectul, declarații părți, semnături | - Template engine validează prezența tuturor câmpurilor obligatorii:<br>  - `{{act_date}}` = mandatory<br>  - `{{act_location}}` = "Biroul notarial [Adresa]"<br>  - `{{parties}}` = Loop prin `CaseParty` cu KYC complet<br>  - `{{subject_matter}}` = `Case.SubjectMatter`<br>  - `{{declarations}}` = Free text sau pre-set clauses<br>  - `{{signatures}}` = Signature blocks pentru fiecare parte + notar | ✅ Ready |
| **Art. 91** | **Citire act:** Notarul citește actul cu voce tare în fața părților înainte de semnare | - UI reminder pentru notar: "Ați citit actul cu voce tare? [✓ DA]" (checkbox obligatoriu înainte de semnare QES)<br>- Audit log: `ActivityLog` entry "Act citit de notar [Timestamp]" | ✅ Ready (checklist) |
| **Art. 92** | **Modificări act:** Modificări ștersături se fac înainte de semnare, se certifică de notar | - UI: "Edit mode" activ până la semnare<br>- După semnare: Document immutable (hash SHA-256 salvat în BD)<br>- Dacă modificare necesară după semnare: **Act adițional** (amendment) separat | ✅ Ready |
| **Art. 93** | **Semnare act:** Părți + notar + martori (dacă aplicabil) semnează | - Workflow semnare:<br>  1. Părți semnează (secvențial sau paralel, configurable)<br>  2. Notar semnează ultimul (validare finală)<br>  3. Martori (dacă cazuri speciale: testamente olografe, procuri speciale) semnează<br>- Signature type: Wet (scan upload) sau QES (Certinomis API)<br>- Insert `Signature` entries for each signatory | ✅ Ready |
| **Art. 100** | **Păstrare arhivă:** Notarul păstrează minuta actului (original) 30 ani | - **Repertoriu Notarial:** Înregistrare obligatorie fiecare act în `RepertoryEntry`<br>- **Storage:** Minute (originale) în S3/Azure Blob cu lifecycle policy:<br>  - Retention: 30 ani (mandatory)<br>  - Glacier/Archive tier după 5 ani (cost optimization)<br>  - Anonymization job după 30 ani (names → "PERSOANĂ X", CNP → hash)<br>- Backup: Daily incremental, weekly full, offsite | ✅ Ready |
| **Art. 101** | **Eliberare copii:** Notarul eliberează copii legalizate ale actului la cerere | - Feature "Eliberare copie legalizată":<br>  1. Client: Request copie (prin Portal Client sau la birou)<br>  2. Notar: Verificare legitimitate solicitant (parte în act sau mandatar)<br>  3. Generate copie din minuta (PDF extraction)<br>  4. Mențiune pe copie: "COPIE LEGALIZATĂ după minuta nr. X din data Y, Notar [Nume]"<br>  5. Notar: Semnează + Sigiliu pe copie<br>  6. Insert `CopyIssuance` (tracking câte copii emise, cui, când)<br>- Cost: €10-50 per copie (conform OUG 119/2022) | ✅ Ready |
| **Art. 102** | **Refuz act:** Notarul refuză actul dacă ilegal, contrar ordinii publice, părți fără capacitate civilă | - Workflow "Refuz dosar":<br>  1. Notar: Detectează problem (ex: conflict of interest grav, act ilegal, parte minoră fără reprezentant legal)<br>  2. Button "Refuză dosar"<br>  3. Reason: [Dropdown: "Conflict of interest" / "Act ilegal" / "Parte fără capacitate" / "Altul"]<br>  4. Explanation: [Free text, mandatory]<br>  5. `Case.Status = 'Rejected'`, `Case.RejectionReason`<br>  6. Notificare client (email): "Din motive legale, nu putem proceda cu actul. Motiv: [...]"<br>  7. Insert `ActivityLog` (audit trail) | ✅ Ready |

---

### 11.2.2. Capitolul III: Incompatibilități & Interdicții (Art. 25-29)

| Articol | Cerință | Implementare LexNotar | Status |
|---------|---------|----------------------|--------|
| **Art. 25** | **Conflict of interest:** Notar nu poate autentica acte unde el/soție/rude până la grad III au interes | - **Detection algorithm** (vezi Annex 10, Section 10.2):<br>  1. Check: Notar = Parte în act? → **REFUZ**<br>  2. Check: Notar = Rudă parte (până grad III)? → **AVERTIZARE** (posibil cu consimțământ scris)<br>  3. Insert `ConflictOfInterest` în BD<br>  4. UI warning banner<br>  5. Resolution: Consimțământ scris sau transfer dosar la alt notar | ✅ Ready |
| **Art. 26** | **Interdicție:** Notar nu poate cumpăra bunuri ale clienților săi | - Similar conflict detection<br>- Check: Notar = Cumpărător în act vânzare-cumpărare unde client = vânzător? → **REFUZ** | ✅ Ready |

---

## 11.3. eIDAS (Regulamentul UE 910/2014) - Compliance QES

### 11.3.1. Cerințe Semnătură Electronică Calificată (QES)

| Cerință eIDAS | Implementare LexNotar | Status |
|---------------|----------------------|--------|
| **Art. 25: QES = echivalent semnătură olografă** | - Integration cu Qualified Trust Service Providers (QTSP): Certinomis, Namirial<br>- QES issued by TSP autorizat în EU Trust List<br>- Certificate validation: OCSP (Online Certificate Status Protocol) check real-time<br>- Timestamp calificat (RFC 3161) pentru probă long-term (30 ani) | ✅ Ready |
| **Art. 32: Validare semnătură** | - Workflow validare:<br>  1. Extract certificate din PDF semnat<br>  2. Verify issuer = QTSP autorizat (check EU Trust List API)<br>  3. OCSP check: Certificate nu e revocat?<br>  4. Timestamp check: Semnătura e în perioada validitate certificat?<br>  5. Hash document: SHA-256 hash match cu cel semnat?<br>- Result: **Valid** / **Invalid** / **Expired**<br>- UI: Badge verde "Semnătură validă" sau roșu "Semnătură invalidă" | ✅ Ready |
| **Art. 35: Long-Term Validation (LTV)** | - **Problem:** Certificate QES expiră după 1-3 ani, dar actele notariale trebuie valide 30 ani<br>- **Solution:** LTV (Long-Term Validation)<br>  1. La semnare: Embed timestamp + OCSP response în PDF (Adobe LTV)<br>  2. Result: PDF "self-contained" cu proof de validitate la momentul semnării<br>  3. Verificare peste 30 ani: Timestamp dovedește că semnătura era validă la data X (chiar dacă certificat acum expirat) | ✅ Ready (via Certinomis API) |
| **Art. 40: Răspundere QTSP** | - Certinomis/Namirial = răspunzători pentru:<br>  - Identificare corectă semnatari (KYC)<br>  - Emitere certificate valide<br>  - Păstrare log-uri (audit trail)<br>- LexNotar: Nu suntem QTSP, doar integram cu QTSP autorizați<br>- Contract cu QTSP: Include clauze răspundere (indemnification) | ✅ Ready (contractual) |

---

## 11.4. OUG 119/2022 (Taxe Notariale) - Calcul Automat

### 11.4.1. Structură Taxe (Art. 1-10)

| Act Type | Bază calcul | Tarif OUG 119/2022 | Implementare LexNotar | Status |
|----------|-------------|-------------------|----------------------|--------|
| **Vânzare-cumpărare imobil** | Valoare tranzacție | **Progresiv:**<br>- 0-50k: €500 fix<br>- 50k-100k: 1%<br>- 100k-200k: 0.5%<br>- 200k-500k: 0.3%<br>- >500k: 0.2% | - Function `CalculateFee(actType, value, currency)`:<br>  ```csharp<br>  public decimal CalculateFee(string actType, decimal value) {<br>    if (actType == "SalePurchase") {<br>      decimal fee = 0;<br>      if (value <= 50000) fee = 500;<br>      else {<br>        fee = 500; // First 50k<br>        if (value > 50000) fee += (Math.Min(value, 100000) - 50000) * 0.01m;<br>        if (value > 100000) fee += (Math.Min(value, 200000) - 100000) * 0.005m;<br>        if (value > 200000) fee += (Math.Min(value, 500000) - 200000) * 0.003m;<br>        if (value > 500000) fee += (value - 500000) * 0.002m;<br>      }<br>      return Math.Round(fee, 2);<br>    }<br>    // ... other act types<br>  }<br>  ```<br>- UI: Preview taxă în real-time când user input valoare | ✅ Ready |
| **Succesiune (moștenire)** | Valoare activ net | **Progresiv:** Similar vânzare-cumpărare | - Similar function, `actType == "Succession"`<br>- Input: `succession.TotalAssetValue - succession.TotalDebtValue` | ✅ Ready |
| **Procură (Power of Attorney)** | **Fix** (nu depinde de valoare) | - **Procură simplă:** €50-100<br>- **Procură generală:** €150-300<br>- **Apostilă:** +€30 | - Dropdown select procură type<br>- Fee auto-populated<br>- If "Apostilă" checkbox → Fee += €30 | ✅ Ready |
| **Donație** | Valoare bunuri donate | **Progresiv:** Similar vânzare | - Similar function, `actType == "Donation"` | ✅ Ready |
| **Contract de ipotecă** | Valoare credit | **Progresiv:** 0.5-1% (lower than sale-purchase) | - Function similar, dar rate mai mici | ✅ Ready |
| **Autentificare semnături** | **Per semnătură** | €10-20 per semnătură | - Input: Număr semnături autentificate<br>- Fee = numSemnaturi × €15 | ✅ Ready |
| **Traduceri autorizate** | **Per pagină** | €15-25 per pagină | - Input: Număr pagini<br>- Fee = numPagini × €20 | ✅ Ready |

---

### 11.4.2. Excepții & Reduceri (Art. 12-15)

| Excepție | Aplicabilitate | Implementare LexNotar | Status |
|----------|---------------|----------------------|--------|
| **Art. 12: Scutiri** | - Acte în interes public (donații către stat, ONG-uri)<br>- Persoane cu dizabilități (certificate de la autorități)<br>- Veterani de război | - Checkbox "Act scutit de taxă" (cu motivare)<br>- Upload document justificativ (certificat dizabilitate, etc.)<br>- Fee = €0 dacă scutit<br>- Mențiune în Repertoriu: "Scutit de taxă conform art. 12 OUG 119/2022" | ✅ Ready |
| **Art. 14: Reduceri multi-act** | Dacă client semnează 3+ acte în aceeași zi, reducere 10-20% | - Detect: Query `Case` cu same `ClientId`, same `ActDate`<br>- If COUNT >= 3: Apply discount 15%<br>- UI: Message "Discount 15% aplicat (3 acte în aceeași zi)" | ✅ Ready |

---

## 11.5. ISO 27001 (Information Security Management) - Roadmap

**Status:** LexNotar nu este ISO 27001 certified la launch, dar **roadmap pentru certificare Year 2-3**

### 11.5.1. Controale ISO 27001:2022 (Annex A)

| Control Domain | Controale Cheie | Implementare LexNotar | Status |
|----------------|----------------|----------------------|--------|
| **A.5: Organizational Controls** | - **A.5.1:** Politici securitate informații<br>- **A.5.7:** Threat intelligence | - Document "Information Security Policy" (50 pagini)<br>- Review anual<br>- Threat intel: Subscripție CERT-RO, OWASP mailing list | ⚠️ To Do (Year 2) |
| **A.8: Asset Management** | - **A.8.1:** Inventar assets (servere, BD, laptops)<br>- **A.8.2:** Clasificare informații (Public, Internal, Confidential, Restricted) | - Asset inventory în Notion/Excel:<br>  - Servere AWS: eu-central-1 (RDS, ECS, S3)<br>  - Laptops: MacBooks (encrypted disk)<br>  - Software licenses: Tracking<br>- Data classification:<br>  - **Restricted:** CNP, date financiare, minute acte<br>  - **Confidential:** Contact clienți, dosare<br>  - **Internal:** Docs interne, proceduri<br>  - **Public:** Website, marketing | ⚠️ Partial (inventory exists, formal classification to do) |
| **A.8: Access Control** | - **A.9.1:** Access control policy (least privilege)<br>- **A.9.2:** User access management<br>- **A.9.4:** MFA | - RBAC: 6 roles (Admin, Notar, Asistent, Contabil, Client, Guest)<br>- PostgreSQL RLS: Row-Level Security per tenant<br>- 2FA: Obligatoriu pentru Admin/Notar<br>- Password policy: Min 12 char, uppercase, lowercase, digit, special | ✅ Ready |
| **A.10: Cryptography** | - **A.10.1:** Encryption policy<br>- **A.10.2:** Key management | - Encryption at rest: AES-256 (RDS, S3)<br>- Encryption in transit: TLS 1.3<br>- Key management: AWS Secrets Manager (KMS-backed)<br>- Key rotation: Annual | ✅ Ready |
| **A.12: Operations Security** | - **A.12.1:** Documented procedures<br>- **A.12.3:** Backup<br>- **A.12.4:** Logging & monitoring | - Runbooks: Deployment, incident response, DR<br>- Backup: Daily incremental, weekly full, retention 90 days<br>- Logging: Structured (JSON), retention 30 ani (audit log), 90 zile (ops log)<br>- Monitoring: Prometheus + Grafana, Alertmanager | ✅ Ready |
| **A.13: Communications Security** | - **A.13.1:** Network security (firewalls, segmentation)<br>- **A.13.2:** Secure email | - AWS Security Groups: Whitelist IPs only<br>- VPN: Mandatory pentru remote admin access<br>- Email: SPF, DKIM, DMARC configured<br>- TLS enforcement pentru email (SendGrid) | ✅ Ready |
| **A.14: System Acquisition, Development, Maintenance** | - **A.14.2:** Secure development lifecycle<br>- **A.14.3:** Test data protection | - SDLC: Git flow, code review (2+ approvals), CI/CD automated tests<br>- Security: OWASP ZAP în CI/CD, Dependabot, Snyk<br>- Test data: Synthetic (no production data în staging)<br>- Staging DB: Anonymized copy production (names/CNP hashed) | ✅ Ready |
| **A.15: Supplier Relationships** | - **A.15.1:** Supplier security policy<br>- **A.15.2:** Supplier service delivery monitoring | - Vendor assessment: Certinomis, SendGrid, Twilio (check ISO 27001/SOC 2 certs)<br>- DPA signed cu GDPR clauses<br>- SLA monitoring: Uptime, response time<br>- Quarterly review: Vendor performance | ⚠️ Partial (DPA signed, formal vendor mgmt to do) |
| **A.16: Information Security Incident Management** | - **A.16.1:** Incident response plan<br>- **A.16.2:** Lessons learned | - Incident Response Playbook (20 pagini):<br>  1. Detection: Alerting (Prometheus)<br>  2. Triage: Severity (P0/P1/P2/P3)<br>  3. Containment: Isolate affected systems<br>  4. Eradication: Remove threat<br>  5. Recovery: Restore from backup<br>  6. Post-mortem: Root cause analysis, corrective actions<br>- Post-incident review: Mandatory pentru P0/P1 | ✅ Process Ready |
| **A.17: Business Continuity** | - **A.17.1:** BC planning<br>- **A.17.2:** Redundancy | - DR Plan: RTO 4h, RPO 1h<br>- Redundancy: Multi-AZ RDS, auto-scaling ECS<br>- Backup: Offsite (S3 cross-region replication)<br>- DR drill: Biannual (test restore) | ✅ Ready |
| **A.18: Compliance** | - **A.18.1:** Compliance cu legi<br>- **A.18.2:** Audit independent | - Compliance matrix: Acest document (GDPR, Legea 36/1995, eIDAS, OUG 119/2022)<br>- Audit independent: **Planificat Year 2** (cost: €10-20k)<br>- ISO 27001 certification: **Target Year 3** (cost: €15-30k) | ⚠️ To Do (Year 2-3) |

---

## 11.6. Audit Checklist Pre-Launch

**Obiectiv:** Verificare conformitate înainte de lansare publică

### 11.6.1. GDPR Checklist (30 items)

| # | Item | Check | Status |
|---|------|-------|--------|
| 1 | Privacy Policy publicată pe website (URL: /privacy-policy) | [ ] | ⚠️ To Do |
| 2 | Cookie banner la prima vizită (consimțământ explicit pentru cookies non-esențiale) | [ ] | ⚠️ To Do |
| 3 | Formular "Contact DPO" (email: dpo@lexnotar.ro) funcțional | [ ] | ⚠️ To Do |
| 4 | Feature "Solicitare date personale" (GDPR art. 15) testat | [ ] | ⚠️ To Test |
| 5 | Feature "Rectificare date" (GDPR art. 16) în Portal Client funcțional | [ ] | ⚠️ To Test |
| 6 | Mesaj explicativ "Drept ștergere limitat" (GDPR art. 17 vs Legea 36/1995) afișat | [ ] | ⚠️ To Do |
| 7 | Encryption at rest activat (RDS, S3) | [ ] | ✅ Done |
| 8 | Encryption in transit activat (TLS 1.3) | [ ] | ✅ Done |
| 9 | PostgreSQL RLS (Row-Level Security) configurat per tenant | [ ] | ✅ Done |
| 10 | Audit log immutabil (PostgreSQL trigger) testat | [ ] | ⚠️ To Test |
| 11 | Anonymization job (după 30 ani) implementat și testat | [ ] | ⚠️ To Test |
| 12 | Data Processing Agreement (DPA) semnat cu subprocesori (SendGrid, Twilio, Certinomis) | [ ] | ⚠️ To Do |
| 13 | Standard Contractual Clauses (SCC) incluse în DPA cu subprocesori non-EU | [ ] | ⚠️ To Do |
| 14 | Registru activități procesare (GDPR art. 30) completat | [ ] | ⚠️ To Do |
| 15 | DPIA (Data Protection Impact Assessment) realizat | [ ] | ⚠️ To Do (pre-launch) |
| 16 | DPO numit (intern sau extern) | [ ] | ⚠️ To Do (Month 6-12) |
| 17 | Template email "Notificare breach GDPR" (art. 33) pregătit | [ ] | ⚠️ To Do |
| 18 | Process "Incident Response" documentat | [ ] | ✅ Done |
| 19 | Contact ANSPDCP (email: anspdcp@dataprotection.ro) salvat | [ ] | ✅ Done |
| 20 | 2FA (Two-Factor Authentication) obligatoriu pentru Admin/Notar activat | [ ] | ✅ Done |
| 21 | Password policy (min 12 char, complexity) enforced | [ ] | ✅ Done |
| 22 | Session timeout (30 min inactivitate) configurat | [ ] | ⚠️ To Test |
| 23 | Rate limiting API (100 req/min per IP) activat | [ ] | ✅ Done |
| 24 | Security headers (Helmet.js: CSP, X-Frame-Options, etc.) configurate | [ ] | ✅ Done |
| 25 | CORS policy (whitelist doar frontend domain) configurat | [ ] | ✅ Done |
| 26 | Input validation (FluentValidation/.NET, Zod/Node.js) implementat | [ ] | ✅ Done |
| 27 | SQL injection prevention (Parameterized queries, ORM) verificat | [ ] | ✅ Done |
| 28 | XSS prevention (Escape HTML în frontend) verificat | [ ] | ✅ Done |
| 29 | CSRF protection (tokens) implementat | [ ] | ⚠️ To Test |
| 30 | Penetration test (OWASP ZAP sau extern) realizat | [ ] | ⚠️ To Do (pre-launch) |

---

### 11.6.2. Legea 36/1995 Checklist (20 items)

| # | Item | Check | Status |
|---|------|-------|--------|
| 1 | Repertoriu Notarial (înregistrare obligatorie acte) implementat | [ ] | ✅ Done |
| 2 | Continuitate numerotare Repertoriu (verificare gap în `act_number`) implementată | [ ] | ✅ Done |
| 3 | Template acte notariale include toate câmpurile obligatorii (art. 90) | [ ] | ⚠️ To Test |
| 4 | Workflow "Citire act în fața părților" (art. 91) cu reminder notar | [ ] | ✅ Done |
| 5 | Document immutability după semnare (hash SHA-256) verificat | [ ] | ⚠️ To Test |
| 6 | Storage minute (originale) 30 ani în S3/Azure Blob configurat | [ ] | ✅ Done |
| 7 | Lifecycle policy S3 (retention 30 ani, apoi anonymization) activat | [ ] | ⚠️ To Test |
| 8 | Backup daily incremental + weekly full configurat | [ ] | ⚠️ To Test |
| 9 | Feature "Eliberare copie legalizată" (art. 101) implementat | [ ] | ✅ Done |
| 10 | Tracking `CopyIssuance` (câte copii emise, cui, când) funcțional | [ ] | ⚠️ To Test |
| 11 | Workflow "Refuz dosar" (art. 102) cu motivare implementat | [ ] | ✅ Done |
| 12 | Detection "Conflict of Interest" (art. 25) cu algoritm funcțional | [ ] | ✅ Done |
| 13 | Resolution conflict: Consimțământ scris / Transfer dosar / Refuz | [ ] | ✅ Done |
| 14 | Verificare capacitate civilă (vârstă, tutelă) implementată | [ ] | ⚠️ To Do |
| 15 | Verificare CNP (checksum algorithm) implementată | [ ] | ✅ Done |
| 16 | Integrare ANAF (verificare CUI, certificat fiscal) testată | [ ] | ⚠️ To Test |
| 17 | Integrare ONRC (Recom.ro, date companii) testată | [ ] | ⚠️ To Test |
| 18 | Integrare QES (Certinomis/Namirial, semnătură electronică) testată | [ ] | ⚠️ To Test |
| 19 | Validare semnătură QES (OCSP, timestamp) implementată | [ ] | ⚠️ To Test |
| 20 | Long-Term Validation (LTV, Adobe PDF) pentru acte QES verificat | [ ] | ⚠️ To Test |

---

### 11.6.3. eIDAS Checklist (10 items)

| # | Item | Check | Status |
|---|------|-------|--------|
| 1 | Integration cu QTSP autorizat (Certinomis/Namirial) completă | [ ] | ⚠️ To Test |
| 2 | Verificare QTSP în EU Trust List (API call) implementată | [ ] | ⚠️ To Do |
| 3 | OCSP check (certificate status) la fiecare semnare implementat | [ ] | ⚠️ To Test |
| 4 | Timestamp calificat (RFC 3161) inclus în semnături QES | [ ] | ⚠️ To Test |
| 5 | Long-Term Validation (LTV) cu OCSP response embedded în PDF | [ ] | ⚠️ To Test |
| 6 | Validare semnătură: Hash document verificat | [ ] | ⚠️ To Test |
| 7 | Validare semnătură: Certificate issuer verificat | [ ] | ⚠️ To Test |
| 8 | Validare semnătură: Timestamp în perioada validitate cert verificat | [ ] | ⚠️ To Test |
| 9 | UI badge "Semnătură validă" / "Semnătură invalidă" funcțional | [ ] | ⚠️ To Test |
| 10 | Contract cu QTSP include clauze răspundere (indemnification) | [ ] | ⚠️ To Do |

---

### 11.6.4. OUG 119/2022 Checklist (5 items)

| # | Item | Check | Status |
|---|------|-------|--------|
| 1 | Calcul taxă notarială progresivă (vânzare-cumpărare) testat cu 10+ cazuri | [ ] | ⚠️ To Test |
| 2 | Calcul taxă notarială pentru toate tip acte (procură, succesiune, donație, etc.) testat | [ ] | ⚠️ To Test |
| 3 | Feature "Act scutit de taxă" (art. 12) cu upload justificativ implementat | [ ] | ⚠️ To Test |
| 4 | Discount multi-act (3+ acte aceeași zi) aplicat automat | [ ] | ⚠️ To Test |
| 5 | Preview taxă în UI (real-time când user input valoare) funcțional | [ ] | ⚠️ To Test |

---

## 11.7. Post-Launch: Continuous Compliance

**Obiectiv:** Menținere conformitate în timp

### 11.7.1. Quarterly Review (Trimestrial)

1. **Audit log review** (sample 100 transactions random)
   - Check: Toate operațiuni loggate?
   - Check: Audit log immutabil (no tampering)?

2. **Access review** (user accounts)
   - Check: Useri inactivi > 90 zile → Disabled?
   - Check: Permissions still appropriate pentru role?

3. **Incident review**
   - Check: Au fost breach-uri? (hopefully NU)
   - Check: Response time conform SLA?

4. **Vendor review** (subprocesori)
   - Check: DPA still valid?
   - Check: Uptime conform SLA? (ex: Certinomis 99.9%)

---

### 11.7.2. Annual Review

1. **GDPR DPIA update** (dacă schimbări majore sistem)
2. **Penetration test** (extern, cost €5-15k)
3. **ISO 27001 mock audit** (Year 2+, pregătire certificare)
4. **Legal review** (dacă legi noi: ex: AI Act, Digital Services Act)
5. **Insurance review** (Cyber insurance policy, €2-5k/year)

---

**[Fin Blueprint LexNotar - All Annexes Complete]**

---

**Contact:**
- **Technical:** dev@lexnotar.ro
- **DPO:** dpo@lexnotar.ro
- **Sales:** sales@lexnotar.ro
- **Support:** support@lexnotar.ro

**Last Updated:** 2025-11-21
**Version:** 1.0.0
**Authors:** LexNotar Product Team
