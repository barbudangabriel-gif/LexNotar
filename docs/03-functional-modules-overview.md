# 3. Functional Modules – Overview

[← Înapoi la Cuprins](../PRODUCT_BLUEPRINT.md) | [← Previous](./02-user-personas.md) | [Next →](./03a-core-case-management.md)

---

## Introducere

LexNotar este construit modular în jurul **dosarului notarial** ca entitate centrală. Fiecare modul rezolvă o parte specifică din workflow-ul zilnic al biroului notarial.

---

## Module Principale

### [3a. Core Case Management](./03a-core-case-management.md)
Inima sistemului: gestionarea completă a dosarelor notariale.
- Lifecycle dosar: Draft → În lucru → Pentru semnare → Semnat → Arhivat
- Părți implicate cu roluri (vânzător, cumpărător, moștenitor, etc.)
- Obiecte juridice (imobil, vehicul, drepturi)
- **Repertoriu Notarial** (obligatoriu legal - Legea 36/1995)
- **Mențiuni pe acte** (anulări, rectificări)
- Checklist-uri configurabile per tip act
- Gestionare documente

### [3b. CRM & Client Management](./03b-crm-client-management.md)
Baza de date centralizată de clienți.
- Fișă client (PF/PJ) cu date complete
- Istoric dosare per client
- Documente KYC reutilizabile
- Flag-uri (client recurent, risc, VIP)

### [3c. Document Automation](./03c-document-automation.md)
Generare automată acte notariale din template-uri.
- Librărie template-uri DOCX cu variabile
- Motor de generare (mapare date → act final)
- Versioning documente
- Minute vs Copii legalizate

### [3d. Scheduling & Calendar](./03d-scheduling-calendar.md)
Calendar multi-user pentru programări.
- Programări cu evitare conflicte
- Reminder-e automate (e-mail/SMS)
- Gestionare săli/resurse

### [3e. Tasks & Workflow](./03e-tasks-workflow.md)
Management task-uri și colaborare echipă.
- Task-uri legate de dosare
- Kanban board
- Notificări și comentarii

### [3f. Billing, Fees & Accounting](./03f-billing-accounting.md)
Facturare și management financiar.
- Calcul automat onorarii (conform OUG 119/2022)
- Generare facturi
- Tracking plăți
- Rapoarte financiare
- Export pentru contabilitate externă

### [3g. Compliance & Risk](./03g-compliance-risk.md)
Conformitate și management risc.
- Audit trail imutabil
- Log acces documente
- KYC/AML support
- GDPR compliance tools
- **Verificare conflict de interese**

### [3h. E-signature & Remote Notarization](./03h-e-signature.md)
Integrare semnătură electronică calificată (QES).
- Integrare vendor-agnostic cu QTSP-uri eIDAS
- Management status semnare
- Remote notarization (modul opțional, dependent legislație)

### [3i. Integrations](./03i-integrations.md)
Conectări cu sisteme externe.
- QES providers (Certinomis, Namirial)
- E-mail/SMS gateways
- ANAF (certificate fiscale)
- ONRC (Registrul Comerțului)
- RAR (Registrul Auto)
- iNot / registre notariale (roadmap)
- Plăți online (roadmap)

---

## Module Roadmap (V2+)

### Client Portal
- Autentificare client
- Upload documente pre-întâlnire
- Vizualizare status dosar
- Descărcare acte semnate
- Plată online

---

## Arhitectură Modulară

Fiecare modul este:
- **Independent logic:** Poate fi dezvoltat/testat separat
- **Cuplat prin API-uri interne:** Module comunică prin interfețe clare
- **Extensibil:** Noi module pot fi adăugate fără rescrierea celor existente

**Exemplu flux inter-module:**
1. **Case Management:** Dosar trece în status "Signed"
2. **Repertoriu:** Înregistrare automată în repertoriu notarial
3. **Billing:** Trigger generare factură
4. **Tasks:** Creare task pentru contabil "Emite factura"
5. **Notifications:** E-mail către client "Actul tău e gata"

---

**[Next: Core Case Management (detaliat) →](./03a-core-case-management.md)**
