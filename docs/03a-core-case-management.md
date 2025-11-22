# 3a. Core Case Management

[← Înapoi la Overview](./03-functional-modules-overview.md) | [Next →](./03b-crm-client-management.md)

---

## Entitatea Centrală: Dosarul Notarial (Case)

Fiecare dosar reprezintă o operațiune notarială completă, de la intake până la arhivare.

---

## Lifecycle Dosar

```
Draft → În lucru → Pentru review → Pentru semnare → Semnat → Arhivat
```

### Status-uri Detaliate

| Status | Descriere | Cine poate tranziția | Condiții |
|--------|-----------|----------------------|----------|
| **Draft** | Dosar nou creat, date incomplete | Asistent | - |
| **În lucru** | Asistent completează checklist, upload documente | Asistent → "Pentru review" | Checklist ≥ 80% (configurabil) |
| **Pentru review** | Așteaptă verificare notar | Notar → "Pentru semnare" sau înapoi | Notar verifică și aprobă |
| **Pentru semnare** | Gata pentru semnare, act generat | Notar inițiază semnare | Act final generat |
| **Semnat** | Act semnat de toate părțile | System (după callback QES) | Toate semnăturile complete |
| **Arhivat** | Dosar închis, factură emisă | Administrator/Notar | Factură plătită (optional) |

### Tranziții Speciale

- **Suspendare:** Dosar blocat temporar (ex: client solicită pauză, lipsă documente critice)
- **Anulare:** Dosar anulat înainte de semnare (client renunță)
- **Invalidare:** Dosar semnat dar anulat ulterior printr-un act nou (creare CaseRelationship)

---

## Componente Dosar

### 1. Date de Bază

- **Număr dosar:** Auto-generat, format: `{NR}/{AN}` (ex: 123/2025)
- **Tip act:** Selectat din listă predefinită (ActType)
- **Office:** Biroul care gestionează dosarul
- **Notar responsabil:** Assigned notary
- **Asistent responsabil:** Assigned assistant
- **Data creare / Data semnare / Data arhivare**
- **Valoare tranzacție:** Pentru calcul onorarii
- **Note interne:** Text liber, vizibil doar echipei

### 2. Părți Implicate (CaseParty)

Relație N-N între Case și Client prin tabela CaseParty.

**Roluri predefinite:**
- Vânzător / Cumpărător
- Donator / Donatar
- Împrumutător / Împrumutat (creditor/debitor)
- Moștenitor / Executor testamentar
- Mandant / Mandatar (procură)
- Curator / Tutore
- Parte (generic)

**Date per parte:**
- Link la Client (PF sau PJ)
- Rol în dosar
- Note specifice (ex: "Cumpărător plătește în rate")

**Validări:**
- Minimum 2 părți (de obicei) - configurabil per tip act
- Verificare conflict de interese: sistem alertează dacă CNP parte = CNP notar sau rudă apropiată

### 3. Obiecte Juridice (CaseObject)

**Tipuri:**
- **Imobil:** Teren, Apartament, Casă, Clădire comercială
- **Vehicul:** Autoturism, Motocicletă, Utilaj
- **Drept:** Uzufruct, Servitute, Drept de superficie
- **Altele:** Bunuri mobile, Acțiuni/Părți sociale, Creanțe

**Date Imobil:**
- Adresă completă (strada, număr, bloc, scară, apartament, oraș, județ)
- Număr cadastral
- Număr carte funciară
- Suprafață (mp)
- Cotă parte (dacă coproprietate, ex: 1/2)
- Valoare declarată
- Sarcini: Checkbox-uri pentru ipotecă, servitute, uzufruct → Detalii în câmp text

**Date Vehicul:**
- Marcă, Model
- An fabricație
- VIN (Vehicle Identification Number)
- Număr înmatriculare
- Valoare

### 4. Checklist Configurabil

**Structură:**
- Derivat din ChecklistTemplate (configurat de administrator per tip act)
- Fiecare item:
  - Titlu (ex: "CI vânzător valabil")
  - Descriere (ex: "Scan color, valabilitate min 6 luni")
  - Obligatoriu: Da/Nu
  - Status: Lipsă / Încărcat / Verificat
  - Document atașat (link la Document)
  - Verificat de (user) + Dată verificare
  - Note

**Logică blocaj:**
- Configurabil: "Dosar nu poate trece în 'Pentru review' dacă checklist < 100%" (sau 80%, 90%)
- Items non-obligatorii pot rămâne necompletate

**Checklist-uri pentru Succesiuni:**
- Multi-fază: Checklist "Declarație moștenitor", apoi Checklist "Inventar", apoi Checklist "Certificat"
- Sistem permite activare secvențială

### 5. Gestionare Documente

**Categorii:**
- **Client Documents:** Documente primite de la clienți (CI, certificate, contracte vechi)
- **Generated Acts:** Acte generate din template
- **Attachments:** Anexe diverse
- **Correspondence:** E-mail-uri, scrisori

**Operațiuni:**
- **Upload:** Drag & drop, multi-file, max 50MB/file
- **Preview:** PDF/imagini în browser
- **Download:** Individual sau ZIP dosar complet
- **Delete:** Soft delete (is_deleted=true), recuperabil de admin
- **Versioning:** Dacă act regenerat → păstrare versiuni (V1, V2, V3...)

**Metadata per document:**
- Nume fișier (original + sanitized)
- Tip fișier / MIME type
- Dimensiune
- Uploaded by (user)
- Data upload
- Categorie
- Link la checklist item (dacă aplicabil)

---

## Repertoriu Notarial (OBLIGATORIU LEGAL)

### Context Legislativ
Legea 36/1995, art. 94: Fiecare act notarial trebuie înregistrat în repertoriu cu număr unic, progresiv.

### Implementare

**Entitate Repertory:**
- `tenant_id`, `office_id`, `year`, `number` (UNIQUE constraint)
- `case_id` (link la dosar)
- `act_type_id`
- `registration_date`, `registration_time`
- `parties_summary` (text: "Ion Popescu - vânzător, Maria Ionescu - cumpărător")
- `object_summary` (text: "Apartament Bd. Magheru nr. 10")
- `notary_fee`, `state_taxes`, `total_amount`
- `notes`
- `created_at` (IMMUTABLE)

**Logică:**
- La tranziție dosar în status "Signed" → Sistem creează automat înregistrare în Repertoriu
- Numerotare: Auto-increment per `(tenant_id, office_id, year)`
  - Exemplu: Primul dosar semnat în 2025 → Repertoriu 1/2025, al doilea → 2/2025, etc.
- **Imutabilitate:** NU se pot șterge sau edita înregistrări repertoriu (append-only)
- Goluri în numerotare: NU sunt permise (dacă dosar anulat după semnare, numărul rămâne în repertoriu cu mențiune "Anulat")

**Export Repertoriu:**
- Pentru control UNNPR sau arhivare: Export PDF/Excel cu toate înregistrările unei perioade
- Format standard: Nr. / Dată / Părți / Obiect / Onorariu / Taxe / Total

---

## Mențiuni pe Acte

### Context
Un act notarial poate fi modificat/anulat/rectificat printr-un act ulterior. Pe actul original se aplică o **mențiune**.

### Entitate Mention

- `case_id` (actul care primește mențiunea)
- `mention_type`: Anulare, Rectificare, Modificare, Notă
- `related_case_id` (actul care generează mențiunea)
- `mention_text` (ex: "Anulat prin actul nr. 456/2025 din 15.12.2025")
- `mention_date`
- `created_by_user_id`

### Flow
1. Se creează Actul 456/2025 care anulează Actul 123/2024
2. La salvare Actul 456 → Sistem solicită: "Acest act anulează un act anterior?" → Yes → Select Case 123/2024
3. Sistem creează Mention pe Case 123/2024: "Anulat prin actul 456/2025"
4. Case 123/2024 rămâne vizibil în sistem cu badge "ANULAT", mențiunea afișată prominent
5. Link bidirectional: Case 123 → "Anulat de Case 456", Case 456 → "Anulează Case 123"

---

## Dosare Speciale: Succesiuni

### Particularități

Succesiunile au workflow multi-fază, nu doar linear.

**Faze:**
1. **Declarație de moștenitor** (identificare moștenitori, verificare testament)
2. **Inventar bunuri** (listă detaliată, evaluare)
3. **Certificat de moștenitor** (act final)
4. **Partaj** (împărțire bunuri, opțional, poate fi dosar separat)

### Entități Suplimentare

**Heir (Moștenitor):**
- `case_id`, `client_id`
- `relationship_to_deceased`: Soț, Copil, Părinte, Frate, Nepot, etc.
- `inheritance_share`: 1/2, 1/3, 33.33%
- `acceptance_status`: Acceptă pur și simplu / Acceptă cu beneficiu de inventar / Renunță
- `acceptance_date`

**Asset (Bun din moștenire):**
- `case_id`
- `asset_type`: Real_Estate, Vehicle, Bank_Account, Shares, Personal_Property, Debt
- `description`
- `estimated_value`
- `allocated_to_heir_id` (după partaj)

### Workflow Succesiune

1. Asistent creează dosar tip "Succesiune - Declarație moștenitor"
2. Adaugă moștenitori (Heir) cu cote
3. Sistem calculează automat cote legale (ex: 3 copii → 1/3 fiecare) sau aplică testament
4. Generează act "Declarație moștenitor"
5. La semnare → Dosar trece în "Signed"
6. Asistent creează **dosar nou** "Succesiune - Certificat moștenitor" (legat de primul prin CaseRelationship)
7. Adaugă Assets (bunuri din moștenire)
8. Generează "Certificat de moștenitor"
9. (Optional) Dosar separat "Partaj" dacă moștenitorii împart bunurile

---

## Procuri și Registru

### PowerOfAttorney (Procură)

Registru separat pentru tracking procuri active/revocate.

**Entitate:**
- `case_id` (dosarul în care s-a emis procura)
- `repertory_number` (nr. repertoriu procurii)
- `principal_client_id` (mandant)
- `agent_client_id` (mandatar)
- `type`: General, Special, Irevocabil, Cu_Substituție
- `scope` (text: pentru ce acte e valabilă)
- `issue_date`, `expiry_date`
- `status`: Active, Revoked, Expired
- `revocation_case_id` (dacă revocată)

### Verificare Automată

Când se adaugă parte "reprezentată prin mandatar" în dosar:
- Sistem query: "Există PowerOfAttorney activă pentru mandant X reprezentat de mandatar Y?"
- Dacă DA → OK, continuă
- Dacă NU → Warning: "Nu există procură activă în sistem, verificați manual"

---

## Conflict de Interese

### Entitate ConflictOfInterest

Registru configurat de fiecare notar cu persoanele în conflict (rude, parteneri de afaceri).

**Date:**
- `notary_user_id`
- `related_person_tax_id` (CNP/CUI)
- `relationship`: Soț/Soție, Părinte, Copil, Frate/Soră, Partener_Afaceri
- `notes`

### Verificare Automată

La adăugare parte în dosar:
1. Sistem verifică: `party.tax_id` există în `ConflictOfInterest` pentru `case.assigned_notary`?
2. Dacă DA → **BLOCARE HARD:** "⛔ CONFLICT DE INTERESE - Ion Popescu (CNP 123...) este ruda notarului Maria. Acest dosar trebuie transferat altui notar."
3. Dosar nu poate continua până când e re-asignat altui notar

---

## Minute vs Copii Legalizate

### Context Legal
- **Minut** = originalul actului notarial, păstrat de notar în arhivă (30 ani minim)
- **Copie legalizată** = copie după minut, eliberată părților

### Implementare

**La generare act final (PDF):**
- Watermark: "MINUT" (păstrat în arhivă digitală)
- Generare copii: Watermark "COPIE LEGALIZATĂ DUPĂ MINUTUL NR. X/2025"

**Entitate CopyIssuance:**
- `case_id`
- `copy_number` (prima copie, a doua copie, etc.)
- `issued_to_client_id`
- `issued_by_user_id`
- `issue_date`
- `recipient_id_card_info` (CI-ul celui care ridică copia)
- `notes`

**Tracking:**
- Asistent marchează: "Eliberată copia nr. 1 către Maria Ionescu la 25.11.2025"
- Istoric vizibil pe dosar: "3 copii eliberate"

---

## Relații între Dosare (CaseRelationship)

Pentru dosare conexe (anulări, rectificări, succesiuni + partaje).

**Entitate:**
- `source_case_id`, `target_case_id`
- `relationship_type`: Anulează, Rectifică, Modifică, Continuă, Partaj_După_Succesiune
- `notes`

**Vizualizare:**
- Pe dosar: Secțiune "Dosare conexe" cu link-uri către dosarele legate
- Exemplu: Dosar #123 (Certificat moștenitor) → Dosar #124 (Partaj)

---

**[Next: CRM & Client Management →](./03b-crm-client-management.md)**
