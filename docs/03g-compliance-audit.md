# 3g. Compliance & Audit Trail

[← Înapoi la Overview](./03-functional-modules-overview.md) | [← Previous](./03f-billing-accounting.md) | [Next →](./03h-e-signature-qes.md)

---

## Obiectiv

Asigurarea conformității cu legislația (GDPR, Law 36/1995, OUG 119/2022), audit trail complet, raportări obligatorii.

---

## Audit Log (Comprehensive Activity Tracking)

### Concept

**Toate acțiunile** critice din sistem sunt înregistrate într-un **audit log imutabil** (append-only).

**Use cases:**
- Investigare incidente: "Cine a șters dosarul #123?"
- Conformitate: "Dovada că am respectat procesul KYC"
- Litigii: "Demonstrare că actul a fost semnat la data X de către client Y"

---

### Entitate: AuditLog

**Date înregistrate:**
- **Timestamp** (cu timezone, precizie milisecundă)
- **User ID** (cine a făcut acțiunea) + IP address
- **Action Type:** (enum)
  - `case.created`, `case.updated`, `case.deleted`, `case.status_changed`
  - `document.uploaded`, `document.downloaded`, `document.deleted`, `document.signed`
  - `client.created`, `client.updated`, `client.gdpr_access_request`, `client.gdpr_deletion_request`
  - `invoice.created`, `invoice.paid`, `invoice.storno`
  - `user.login`, `user.logout`, `user.failed_login`, `user.permission_changed`
  - `repertory.entry_created`, `repertory.entry_updated`
  - `conflict_of_interest.detected`, `conflict_of_interest.resolved`
  - Etc. (50+ event types)
- **Entity Type + Entity ID:** (ex: `Case`, `123`)
- **Changes:** JSON diff (before/after values pentru update-uri)
- **Metadata:** Browser, OS, Device (din user agent)
- **IP Address**

---

### Exemplu Audit Entry

```json
{
  "id": "audit_789456",
  "timestamp": "2025-11-21T14:35:22.123Z",
  "user_id": "user_456",
  "user_name": "Andreea Ionescu (Asistent)",
  "ip_address": "192.168.1.50",
  "action_type": "case.status_changed",
  "entity_type": "Case",
  "entity_id": "123",
  "changes": {
    "status": {
      "before": "KYC",
      "after": "Document Preparation"
    }
  },
  "metadata": {
    "browser": "Chrome 120",
    "os": "Windows 11"
  }
}
```

---

### Storage Audit Log

**Cerințe:**
- **Imutabil:** Odată scris, NU se poate edita/șterge (append-only)
- **Retention:** 30 ani (conform cerințe arhivare notariat)
- **Backup:** Zilnic, off-site

**Implementare:**
- **DB principal:** PostgreSQL (cu trigger-e care blochează UPDATE/DELETE pe tabel audit_log)
- **Backup:** S3 Glacier / Azure Archive (cost-efficient pentru long-term storage)
- **Alternative:** Elasticsearch pentru search performant pe log-uri mari

---

## GDPR Compliance

### Drepturi Subiect Date (Data Subject Rights)

**Conform GDPR, clientul are:**
1. **Drept acces** (Art. 15) - "Vreau să văd ce date aveți despre mine"
2. **Drept rectificare** (Art. 16) - "Corectați adresa mea"
3. **Drept ștergere / "dreptul de a fi uitat"** (Art. 17) - "Ștergeți datele mele"
4. **Drept restricționare prelucrare** (Art. 18) - "Înghețați datele mele"
5. **Drept portabilitate** (Art. 20) - "Dați-mi datele într-un format structurat"
6. **Drept opoziție** (Art. 21) - "Nu vreau marketing"

---

### GDPR Access Request (Drept Acces)

**Flow:**
1. **Client:** Trimite cerere (e-mail/poștă): "Solicit copie date personale prelucrate"
2. **Administrator LexNotar:** Clients → Client "Popescu Ion" → "GDPR: Export date"
3. **Sistem:**
   - Colectează toate datele client din sistem:
     - Date personale (CNP, CI, adresă, telefon, e-mail)
     - Dosare în care apare (ca parte, reprezentant, etc.)
     - Documente uploadate/semnate
     - Facturi emise
     - Audit log acțiuni client (login-uri în portal client, dacă există)
   - Generează PDF structurat + ZIP cu documente
4. **Administrator:** Descarcă pachet, trimite către client (e-mail criptat sau poștă)
5. **Sistem:** Log action `client.gdpr_access_request` în audit log

**Termen legal:** 30 zile de la primirea cererii.

---

### GDPR Deletion Request (Dreptul de a fi Uitat)

**Complexitate:** Notarii au **obligația legală de a păstra dosarele 30 ani** (Law 36/1995).

**Conflict aparent:** GDPR (drept ștergere) vs. Law 36/1995 (obligație păstrare).

**Rezolvare:**
- **Art. 17(3)(b) GDPR:** Dreptul ștergerii NU se aplică dacă prelucrarea este necesară pentru **respectarea unei obligații legale**.
- **Concluzie:** Notarul NU poate șterge datele din dosarele finalizate (obligație legală 30 ani).

**Flow în LexNotar:**
1. **Client:** Cere ștergere date
2. **Administrator:** Client → "GDPR: Evaluare cerere ștergere"
3. **Sistem afișează:**
   - ✅ Date care pot fi șterse:
     - Marketing lists (dacă există)
     - Date colectate pentru dosare neînchegate (anulate de client înainte de semnare)
   - ❌ Date care NU pot fi șterse:
     - Dosare finalizate (repertoriu, acte semnate) - **obligație legală 30 ani**
4. **Administrator:** Aprobă ștergerea parțială
5. **Sistem:**
   - Șterge datele eligibile
   - Generează răspuns standard: "Date șterse parțial. Date legate de acte notariale păstrate conform Law 36/1995 (obligație legală 30 ani)."
6. **Administrator:** Trimite răspuns client

---

### GDPR Anonymization (pentru Dosare Vechi)

**Use case:** După 30 ani, obligația păstrare expiră → Anonymizare date pentru protecție privacy.

**Flow automat:**
1. **Job zilnic:** Găsește dosare cu `closed_date` > 30 ani
2. **Sistem:**
   - Păstrează structura dosar (nr. repertoriu, tip act, valoare)
   - **Anonimizează:** CNP → hash, Nume → "Persoană Fizică A", Adresă → "Municipiu București"
   - Marchează dosar `anonymized: true`
3. **Rezultat:** Date statistice păstrate (ex: "vânzare imobil 250.000 RON în 1995"), dar identitate client ștearsă.

---

## Conflict of Interest - Audit Trail

### Logging Conflict Detection

**Flow:**
1. **Sistem:** Detectează conflict (client Popescu apare în 2 dosare opuse)
2. **Audit log:**
   ```json
   {
     "action_type": "conflict_of_interest.detected",
     "entity_type": "Case",
     "entity_id": "125",
     "details": {
       "client_id": "client_789",
       "conflicting_case_id": "120",
       "conflict_type": "opposing_parties"
     }
   }
   ```
3. **Notificare notar:** Alert + Task creat automat
4. **Notar:** Analizează → Decision: "Accept cu consimțământ scris" sau "Refuz dosar"
5. **Audit log:**
   ```json
   {
     "action_type": "conflict_of_interest.resolved",
     "entity_id": "125",
     "resolution": "accepted_with_consent",
     "consent_document_id": "doc_999"
   }
   ```

**Beneficiu:** Dovada că notarul a respectat obligațiile deontologice (Law 36/1995, Art. 11 - incompatibilități).

---

## Repertoriu Notarial - Compliance

### Obligații Legale

**Law 36/1995:** Notarul trebuie să țină **Repertoriu cronologic** al tuturor actelor:
- Număr curent (1, 2, 3, ... pe an)
- Data act
- Obiectul actului
- Părți
- Valoare (dacă aplicabil)

**Sancțiuni:** Neținerea repertoriului = abatere disciplinară (sancțiuni Camera Notarilor).

---

### Audit Repertoriu în LexNotar

**Verificări automate:**
1. **Continuitate numere:** 
   - Sistem verifică: Nr. 1, 2, 3, ... (fără goluri)
   - Dacă lipsește nr. 5 → Alert: "🔴 Lipsă nr. repertoriu 5 în registrul 2025"

2. **Kronologie date:**
   - Repertoriu trebuie cronologic (nr. 5 = data 20.11, nr. 6 = data 21.11, nu 19.11)
   - Dacă data anterioară → Warning: "⚠️ Data act #6 (19.11) e înainte de #5 (20.11)"

3. **Completitudine date:**
   - Fiecare entry trebuie să aibă: Nr., Dată, Obiect, Părți
   - Dacă lipsesc → Error: "❌ Repertoriu #7 incomplet (lipsă părți)"

**Raport lunar:** "Repertoriu noiembrie 2025 verificat: 45 acte, ✅ fără erori."

---

## Raportare către Camera Notarilor Publici

### Raport Anual Activitate

**Obligație:** Notarii raportează anual Camera Notarilor:
- Nr. total acte autentificate (per tip)
- Onorarii încasate (total)
- Nr. copii legalizate eliberate

**LexNotar - Generare automată:**
1. **Administrator:** Rapoarte → "Raport anual Camera Notarilor 2025"
2. **Sistem:**
   - Extrage date din repertoriu + facturare
   - Generează raport format standard (PDF/Excel)
3. **Administrator:** Descarcă, semnează (QES), transmite Camera Notarilor

---

## Data Breach Response (GDPR Art. 33/34)

### Obligații GDPR

**Dacă breach (incident securitate cu risc pentru date personale):**
- **72 ore:** Notificare către ANSPDCP (Autoritatea Națională Supraveghere Prelucrare Date)
- **Fără întârziere:** Notificare clienți afectați (dacă risc ridicat)

---

### LexNotar - Incident Management

**Entitate: SecurityIncident**

**Date:**
- Dată/oră detectare
- Tip incident: Unauthorized access, Data leak, Ransomware, etc.
- Date afectate: Care tabele/entități (ex: "100 clienți, date CNP + adresă")
- Cauză: (ex: "Phishing attack pe cont asistent")
- Măsuri imediate: (ex: "Blocare cont compromis, reset parole")
- Risk assessment: Low / Medium / High
- Notificare ANSPDCP: Da/Nu, Timestamp
- Notificare clienți: Da/Nu, Listă clienți notificați

**Flow:**
1. **Detectare:** Ex: Audit log arată 500 download-uri documente de la IP necunoscut
2. **Administrator:** Security → "Raportează incident"
3. **Form:** Completează detalii incident
4. **Sistem:**
   - Creează SecurityIncident entry
   - Generează raport ANSPDCP (template)
   - (Dacă high risk) Generează draft e-mail-uri notificare clienți
5. **Administrator:** Revizuiește, trimite notificări

---

## Backup & Disaster Recovery - Audit

### Cerințe

**RTO (Recovery Time Objective):** Max 4 ore
**RPO (Recovery Point Objective):** Max 1 oră (pierdere maximă date acceptabilă)

---

### Backup Strategy

**Daily full backup:**
- Database PostgreSQL → S3 / Azure Blob
- Documents (S3/Blob) → Cross-region replication
- Retention: 30 zile backup daily, apoi lunar pentru 30 ani

**Hourly incremental backup:**
- Transaction log shipping
- RPO: 1 oră

**Disaster recovery test:**
- Trimestrial: Test restore din backup
- Audit log: `backup.restore_test_successful` (dovada că backup-urile funcționează)

---

### Audit Backup

**Verificări automate:**
- Daily job verifică: "Backup de ieri a rulat cu succes?"
- Dacă fail → Alert critic către administrator + IT

**Log exemplu:**
```json
{
  "action_type": "backup.completed",
  "timestamp": "2025-11-21T02:00:00Z",
  "backup_size": "15.3 GB",
  "duration_seconds": 420,
  "status": "success"
}
```

---

## User Access Audit

### Login Tracking

**Toate login-urile înregistrate:**
- Successful login: User, IP, timestamp, device
- Failed login: Username attempt, IP, reason (wrong password, account locked, etc.)

**Security alerts:**
- **5 failed logins consecutivi:** Blocare cont 15 minute
- **Login din IP necunoscut:** E-mail către user: "Nou login detectat din Timișoara. Ai fost tu?"
- **Login din țară străină:** Alert administrator (posibil compromis)

---

### Permission Changes Audit

**Exemplu:**
```json
{
  "action_type": "user.permission_changed",
  "timestamp": "2025-11-20T10:00:00Z",
  "admin_user_id": "user_1",
  "admin_user_name": "Alexandru Admin",
  "target_user_id": "user_456",
  "target_user_name": "Andreea Asistent",
  "changes": {
    "role": {
      "before": "Assistant",
      "after": "Senior Assistant"
    },
    "permissions_added": ["can_approve_invoices"]
  }
}
```

**Beneficiu:** Tracking complete cine a dat ce permisiuni cui (important pentru audit).

---

## Compliance Dashboard

### View Administrator

**KPI-uri compliance:**
- ✅ **Repertoriu:** La zi, fără lipsuri (45/45 acte noiembrie)
- ✅ **GDPR requests:** 2 cereri luna curentă, rezolvate în termen (media 12 zile)
- ⚠️ **Backup:** Ultimul backup: Azi 02:00 (success)
- ✅ **Security:** 0 incidente luna curentă
- ⚠️ **Clienți restanți:** 3 facturi > 30 zile (necesită follow-up)

**Alerts:**
- 🔴 "Dosar #130 lipsește din repertoriu - Act semnat dar neinregistrat"
- 🟡 "Cerere GDPR de la client Ionescu - Termen 15 zile rămase"

---

## eIDAS Compliance (QES)

### Audit QES Signatures

**Obligație:** Păstrare dovada validității semnăturii electronice (QES) pe termen lung.

**LexNotar:**
- La semnare QES → Sistem descarcă **certificatul semnatarului** + **timestamp** (RFC 3161)
- Store împreună cu documentul semnat
- Verificare periodică (anual) validitate semnături → Regenerare timestamp (dacă certificat expiră)

**Audit log:**
```json
{
  "action_type": "document.qes_signed",
  "document_id": "doc_123",
  "signer_name": "Popescu Ion",
  "certificate_issuer": "Certinomis",
  "certificate_serial": "ABC123456",
  "timestamp": "2025-11-21T15:00:00Z",
  "timestamp_authority": "Certinomis TSA"
}
```

**Beneficiu:** Dovada validității semnăturii peste 30 ani (chiar dacă certificatul a expirat).

---

**[Next: E-Signature & QES Integration →](./03h-e-signature-qes.md)**
