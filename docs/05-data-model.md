# 5. Data Model

[← Înapoi la Blueprint](../PRODUCT_BLUEPRINT.md) | [← Previous](./04-non-functional-requirements.md) | [Next →](./06-system-architecture.md)

---

## Obiectiv

Definirea entităților principale, relații, și structura bazei de date pentru LexNotar.

---

## 5.1. Entity Relationship Overview

```
Office (1) ──< (N) User
Office (1) ──< (N) Case
Office (1) ──< (N) Client (Person/Company)
Office (1) ──< (N) RepertoryEntry

Case (1) ──< (N) CaseParty (link Case ↔ Person/Company)
Case (1) ──< (N) Document
Case (1) ──< (N) Task
Case (1) ──< (N) Appointment
Case (1) ──< (N) Invoice
Case (1) ──< (N) ActivityLog
Case (1) ──< (N) ConflictOfInterest
Case (N) ──< (1) RepertoryEntry

Document (1) ──< (N) Signature
Document (1) ──< (N) DocumentVersion

Person/Company (1) ──< (N) CaseParty
Person/Company (1) ──< (N) PowerOfAttorney (as Grantor or Grantee)

Task (N) ──> (1) User (assigned)
Appointment (N) ──> (1) User (notar)

ConflictOfInterest (N) ──> (2+) Case (conflicting cases)
```

---

## 5.2. Core Entities

### 5.2.1. Office

**Multi-tenant root entity.**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique office ID |
| `name` | VARCHAR(255) | NOT NULL | Ex: "Cabinet Notarial Maria Popescu" |
| `type` | ENUM | NOT NULL | `notary_office`, `legal_office` |
| `registration_number` | VARCHAR(50) | UNIQUE | Nr. înregistrare Camera Notarilor |
| `tax_id` | VARCHAR(20) | NOT NULL | CUI notariat |
| `address` | TEXT | | Adresă completă |
| `city` | VARCHAR(100) | | |
| `county` | VARCHAR(100) | | Județul |
| `phone` | VARCHAR(20) | | |
| `email` | VARCHAR(255) | | |
| `iban` | VARCHAR(34) | | Pentru facturare |
| `bank_name` | VARCHAR(255) | | |
| `subscription_plan` | ENUM | | `starter`, `professional`, `business`, `enterprise` |
| `subscription_status` | ENUM | | `active`, `suspended`, `cancelled` |
| `subscription_expires_at` | TIMESTAMP | | |
| `settings` | JSONB | | Office-specific config (theme, language, etc.) |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_office_registration_number` ON `registration_number`
- `idx_office_subscription_status` ON `subscription_status`

---

### 5.2.2. User

**Utilizatori sistem (notari, asistenți, contabili).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt/Argon2 |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `role` | ENUM | NOT NULL | `admin`, `notar`, `senior_assistant`, `assistant`, `accountant`, `read_only` |
| `phone` | VARCHAR(20) | | |
| `notary_license_number` | VARCHAR(50) | | Doar pentru notari |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `two_factor_enabled` | BOOLEAN | DEFAULT FALSE | |
| `two_factor_secret` | VARCHAR(255) | | TOTP secret |
| `last_login_at` | TIMESTAMP | | |
| `last_login_ip` | VARCHAR(45) | | IPv4/IPv6 |
| `failed_login_attempts` | INTEGER | DEFAULT 0 | |
| `account_locked_until` | TIMESTAMP | | Auto-unlock după 15 min |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_user_office_id` ON `office_id`
- `idx_user_email` ON `email`
- `idx_user_role` ON `role`

---

### 5.2.3. Person (Persoană Fizică)

**Client individual.**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `cnp` | VARCHAR(13) | NOT NULL | Cod Numeric Personal (validat) |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `birth_date` | DATE | | Extras din CNP |
| `birth_place` | VARCHAR(255) | | |
| `id_type` | ENUM | | `ci`, `passport`, `residence_permit` |
| `id_series` | VARCHAR(10) | | Serie CI (ex: "AB") |
| `id_number` | VARCHAR(20) | | Nr. CI |
| `id_issued_by` | VARCHAR(255) | | Emis de (ex: "SPCLEP Sector 1") |
| `id_issued_date` | DATE | | |
| `id_expires_date` | DATE | | |
| `address` | TEXT | | Adresă domiciliu |
| `city` | VARCHAR(100) | | |
| `county` | VARCHAR(100) | | |
| `country` | VARCHAR(100) | DEFAULT 'România' | |
| `phone` | VARCHAR(20) | | |
| `email` | VARCHAR(255) | | |
| `marital_status` | ENUM | | `single`, `married`, `divorced`, `widowed` |
| `marriage_regime` | ENUM | | `community`, `separation` (dacă married) |
| `spouse_id` | UUID | FK → Person | Link către soț/soție |
| `occupation` | VARCHAR(255) | | |
| `employer` | VARCHAR(255) | | |
| `kyc_status` | ENUM | | `pending`, `verified`, `rejected` |
| `kyc_verified_at` | TIMESTAMP | | |
| `kyc_verified_by` | UUID | FK → User | |
| `gdpr_consent_marketing` | BOOLEAN | DEFAULT FALSE | |
| `gdpr_consent_date` | TIMESTAMP | | |
| `notes` | TEXT | | Note interne (nu vizibile client) |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_person_office_id` ON `office_id`
- `idx_person_cnp` ON `cnp` (partial: WHERE cnp IS NOT NULL)
- `idx_person_full_name` ON `last_name, first_name` (for search)
- `idx_person_kyc_status` ON `kyc_status`

**Constraints:**
- `UNIQUE (office_id, cnp)` - Același CNP poate fi în mai multe office-uri (multi-tenant)

---

### 5.2.4. Company (Persoană Juridică)

**Client firmă.**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `cui` | VARCHAR(20) | NOT NULL | Cod Unic Înregistrare |
| `registration_number` | VARCHAR(50) | | J40/1234/2020 (ONRC) |
| `name` | VARCHAR(255) | NOT NULL | Denumire |
| `legal_form` | VARCHAR(50) | | SRL, SA, PFA, II, etc. |
| `headquarters_address` | TEXT | | Sediu social |
| `city` | VARCHAR(100) | | |
| `county` | VARCHAR(100) | | |
| `country` | VARCHAR(100) | DEFAULT 'România' | |
| `phone` | VARCHAR(20) | | |
| `email` | VARCHAR(255) | | |
| `share_capital` | DECIMAL(15,2) | | Capital social (RON) |
| `share_capital_paid` | DECIMAL(15,2) | | Capital vărsat |
| `vat_registered` | BOOLEAN | | Plătitor TVA? |
| `vat_number` | VARCHAR(20) | | RO12345678 |
| `incorporation_date` | DATE | | Data înființare |
| `main_activity_code` | VARCHAR(10) | | Cod CAEN principal |
| `main_activity_description` | TEXT | | |
| `kyc_status` | ENUM | | `pending`, `verified`, `rejected` |
| `kyc_verified_at` | TIMESTAMP | | |
| `kyc_verified_by` | UUID | FK → User | |
| `notes` | TEXT | | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_company_office_id` ON `office_id`
- `idx_company_cui` ON `cui`
- `idx_company_name` ON `name` (for search)

**Constraints:**
- `UNIQUE (office_id, cui)`

---

### 5.2.5. CompanyRepresentative

**Link Person ↔ Company (administratori, reprezentanți legali).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `company_id` | UUID | FK → Company, NOT NULL | |
| `person_id` | UUID | FK → Person, NOT NULL | |
| `role` | ENUM | NOT NULL | `administrator`, `legal_representative`, `shareholder` |
| `appointment_date` | DATE | | Data numirii |
| `valid_until` | DATE | | Daca temporar (procură) |
| `powers` | TEXT | | Descriere atribuții |
| `created_at` | TIMESTAMP | NOT NULL | |

**Indexes:**
- `idx_company_rep_company_id` ON `company_id`
- `idx_company_rep_person_id` ON `person_id`

---

### 5.2.6. Case (Dosar)

**Entitatea centrală - dosar notarial.**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `case_number` | VARCHAR(50) | NOT NULL | Ex: "2025/123" (unique per office per year) |
| `case_type` | ENUM | NOT NULL | `sale_purchase_real_estate`, `sale_purchase_vehicle`, `donation`, `power_of_attorney`, `succession`, `will`, `incorporation`, `loan_agreement`, `other` |
| `case_subtype` | VARCHAR(100) | | Ex: "Apartament", "Casa", "Teren" |
| `status` | ENUM | NOT NULL | `kyc`, `document_preparation`, `ready_for_signing`, `signed`, `closed`, `cancelled` |
| `priority` | ENUM | DEFAULT 'normal' | `low`, `normal`, `high`, `urgent` |
| `assigned_notary_id` | UUID | FK → User, NOT NULL | Notar responsabil |
| `assigned_assistant_id` | UUID | FK → User | Asistent responsabil |
| `object_description` | TEXT | | Obiectul actului (ex: "Vânzare apartament str. Exemplu nr. 1") |
| `property_address` | TEXT | | Dacă imobil |
| `cadastral_number` | VARCHAR(50) | | Nr. cadastral |
| `land_registry_number` | VARCHAR(50) | | Nr. Carte Funciară |
| `vehicle_vin` | VARCHAR(17) | | VIN (dacă vânzare auto) |
| `contract_value` | DECIMAL(15,2) | | Valoare tranzacție (RON sau EUR) |
| `contract_currency` | VARCHAR(3) | DEFAULT 'RON' | ISO 4217 |
| `notary_fee` | DECIMAL(10,2) | | Onorar calculat |
| `notary_fee_paid` | BOOLEAN | DEFAULT FALSE | |
| `deadline` | DATE | | Termen finalizare (opțional) |
| `opened_at` | TIMESTAMP | NOT NULL | Data deschidere dosar |
| `signed_at` | TIMESTAMP | | Data semnare act |
| `closed_at` | TIMESTAMP | | Data închidere dosar |
| `notes` | TEXT | | Note interne |
| `tags` | TEXT[] | | Array tag-uri (ex: ["urgent", "vip_client"]) |
| `created_by` | UUID | FK → User, NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_case_office_id` ON `office_id`
- `idx_case_case_number` ON `case_number`
- `idx_case_status` ON `status`
- `idx_case_assigned_notary` ON `assigned_notary_id`
- `idx_case_opened_at` ON `opened_at` (for date range queries)
- `idx_case_tags` USING GIN ON `tags` (PostgreSQL array index for tag search)

**Constraints:**
- `UNIQUE (office_id, case_number)`

---

### 5.2.7. CaseParty

**Link Case ↔ Person/Company (părțile dosarului).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `case_id` | UUID | FK → Case, NOT NULL | |
| `party_type` | ENUM | NOT NULL | `person`, `company` |
| `party_id` | UUID | NOT NULL | FK → Person OR Company (polymorphic) |
| `role` | ENUM | NOT NULL | `seller`, `buyer`, `donor`, `donee`, `grantor`, `grantee`, `testator`, `heir`, `founder`, `borrower`, `lender`, `other` |
| `ownership_share` | VARCHAR(20) | | Ex: "1/2" (dacă mai mulți proprietari) |
| `represented_by_id` | UUID | FK → Person | Dacă reprezentat prin procură |
| `power_of_attorney_id` | UUID | FK → PowerOfAttorney | |
| `notes` | TEXT | | |
| `created_at` | TIMESTAMP | NOT NULL | |

**Indexes:**
- `idx_case_party_case_id` ON `case_id`
- `idx_case_party_party_id` ON `party_id`
- `idx_case_party_role` ON `role`

---

### 5.2.8. Document

**Documente dosar (upload, generate, semnate).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `case_id` | UUID | FK → Case, NOT NULL | |
| `office_id` | UUID | FK → Office, NOT NULL | (denormalized for queries) |
| `name` | VARCHAR(255) | NOT NULL | Ex: "Act_vanzare_Popescu_Ionescu.pdf" |
| `type` | ENUM | NOT NULL | `minute`, `authenticated_copy`, `attachment`, `supporting_document`, `template_generated`, `signed_act` |
| `category` | VARCHAR(100) | | Ex: "ID Card", "Land Registry Extract", "Tax Certificate" |
| `file_path` | TEXT | NOT NULL | S3/Blob path: `office_123/case_456/doc_789_filename.pdf` |
| `file_size` | BIGINT | NOT NULL | Bytes |
| `mime_type` | VARCHAR(100) | NOT NULL | `application/pdf`, `image/jpeg`, etc. |
| `version` | INTEGER | DEFAULT 1 | Document versioning |
| `parent_document_id` | UUID | FK → Document | Link to previous version |
| `is_minute` | BOOLEAN | DEFAULT FALSE | True dacă minută (original) |
| `is_signed` | BOOLEAN | DEFAULT FALSE | |
| `signature_count` | INTEGER | DEFAULT 0 | Nr. semnături aplicate |
| `ocr_status` | ENUM | | `pending`, `processing`, `completed`, `failed` |
| `ocr_text` | TEXT | | Text extras (pentru full-text search) |
| `uploaded_by` | UUID | FK → User, NOT NULL | |
| `uploaded_at` | TIMESTAMP | NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_document_case_id` ON `case_id`
- `idx_document_office_id` ON `office_id`
- `idx_document_type` ON `type`
- `idx_document_uploaded_at` ON `uploaded_at`
- Full-text search: `idx_document_ocr_text` USING GIN ON `to_tsvector('romanian', ocr_text)`

---

### 5.2.9. Signature

**Semnături electronice pe documente.**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `document_id` | UUID | FK → Document, NOT NULL | |
| `case_id` | UUID | FK → Case, NOT NULL | (denormalized) |
| `signer_type` | ENUM | NOT NULL | `person`, `company_representative` |
| `signer_id` | UUID | NOT NULL | FK → Person (CNP semnatarului) |
| `signature_type` | ENUM | NOT NULL | `qes`, `aes`, `handwritten_scanned` |
| `tsp_provider` | VARCHAR(100) | | Ex: "Certinomis", "Namirial" |
| `tsp_session_id` | VARCHAR(255) | | External session ID |
| `certificate_issuer` | VARCHAR(255) | | Ex: "Certinomis CA" |
| `certificate_serial` | VARCHAR(255) | | |
| `certificate_valid_from` | TIMESTAMP | | |
| `certificate_valid_to` | TIMESTAMP | | |
| `signature_timestamp` | TIMESTAMP | | Data/ora semnării efective |
| `timestamp_authority` | VARCHAR(255) | | TSA (RFC 3161) |
| `signature_position` | JSONB | | `{"page": 5, "x": 100, "y": 700}` |
| `status` | ENUM | NOT NULL | `pending`, `signed`, `rejected`, `expired`, `invalid` |
| `validation_status` | ENUM | | `valid`, `invalid`, `revoked`, `expired` |
| `last_validated_at` | TIMESTAMP | | |
| `rejection_reason` | TEXT | | Dacă rejected |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_signature_document_id` ON `document_id`
- `idx_signature_case_id` ON `case_id`
- `idx_signature_signer_id` ON `signer_id`
- `idx_signature_status` ON `status`

---

### 5.2.10. RepertoryEntry (Repertoriu Notarial)

**Registru cronologic acte notariale (obligatoriu legal).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `case_id` | UUID | FK → Case, NOT NULL | |
| `repertory_number` | INTEGER | NOT NULL | Nr. curent (1, 2, 3, ...) per an |
| `repertory_year` | INTEGER | NOT NULL | 2025 |
| `act_date` | DATE | NOT NULL | Data autentificării actului |
| `act_type` | VARCHAR(255) | NOT NULL | "Vânzare-cumpărare imobil" |
| `act_object` | TEXT | NOT NULL | "Apartament str. Exemplu nr. 1" |
| `parties_summary` | TEXT | NOT NULL | "Popescu Ion → Ionescu Maria" |
| `contract_value` | DECIMAL(15,2) | | |
| `contract_currency` | VARCHAR(3) | | |
| `notary_fee` | DECIMAL(10,2) | | |
| `notary_id` | UUID | FK → User, NOT NULL | Notar autentificator |
| `minute_pages` | INTEGER | | Nr. pagini minută |
| `copies_issued` | INTEGER | DEFAULT 0 | Nr. copii legalizate emise inițial |
| `inot_id` | VARCHAR(255) | | ID înregistrare iNot (dacă există) |
| `notes` | TEXT | | |
| `created_by` | UUID | FK → User, NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_repertory_office_id` ON `office_id`
- `idx_repertory_year` ON `repertory_year`
- `idx_repertory_number_year` ON `repertory_number, repertory_year`
- `idx_repertory_act_date` ON `act_date`

**Constraints:**
- `UNIQUE (office_id, repertory_number, repertory_year)` - Nr. unic per an per office

---

### 5.2.11. Mention (Mențiune pe Act)

**Mențiuni adăugate pe acte existente (ex: plata prețului, radierea ipotecii).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `repertory_entry_id` | UUID | FK → RepertoryEntry, NOT NULL | Act pe care se face mențiunea |
| `mention_date` | DATE | NOT NULL | Data mențiunii |
| `mention_type` | VARCHAR(100) | NOT NULL | "Plata prețului", "Radiere ipotecă", etc. |
| `description` | TEXT | NOT NULL | Detalii mențiune |
| `notary_id` | UUID | FK → User, NOT NULL | |
| `document_id` | UUID | FK → Document | Document justificativ (opțional) |
| `created_by` | UUID | FK → User, NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |

**Indexes:**
- `idx_mention_repertory_entry_id` ON `repertory_entry_id`
- `idx_mention_date` ON `mention_date`

---

### 5.2.12. CopyIssuance (Eliberare Copii)

**Tracking copii legalizate eliberate (obligație legală evidență).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `repertory_entry_id` | UUID | FK → RepertoryEntry, NOT NULL | |
| `issued_date` | DATE | NOT NULL | |
| `recipient_name` | VARCHAR(255) | NOT NULL | Cui s-a eliberat |
| `recipient_cnp_cui` | VARCHAR(20) | | |
| `recipient_id_series_number` | VARCHAR(50) | | Serie + nr. CI |
| `copy_number` | INTEGER | | Nr. copie (ex: copia nr. 3) |
| `pages_count` | INTEGER | | Nr. pagini copie |
| `issued_by` | UUID | FK → User, NOT NULL | Cine a eliberat |
| `notes` | TEXT | | |
| `created_at` | TIMESTAMP | NOT NULL | |

**Indexes:**
- `idx_copy_issuance_repertory_entry_id` ON `repertory_entry_id`
- `idx_copy_issuance_issued_date` ON `issued_date`

---

### 5.2.13. Task

**Task management (vezi 03e-tasks-workflow.md).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `case_id` | UUID | FK → Case | NULL dacă task general (nu legat de dosar) |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | | |
| `status` | ENUM | NOT NULL | `to_do`, `in_progress`, `blocked`, `done`, `cancelled` |
| `priority` | ENUM | DEFAULT 'normal' | `low`, `normal`, `high`, `critical` |
| `assigned_to` | UUID | FK → User | |
| `created_by` | UUID | FK → User, NOT NULL | |
| `deadline` | TIMESTAMP | | |
| `completed_at` | TIMESTAMP | | |
| `tags` | TEXT[] | | |
| `checklist` | JSONB | | Array `[{"item": "...", "checked": false}, ...]` |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_task_case_id` ON `case_id`
- `idx_task_office_id` ON `office_id`
- `idx_task_assigned_to` ON `assigned_to`
- `idx_task_status` ON `status`
- `idx_task_deadline` ON `deadline`

---

### 5.2.14. Appointment

**Programări (vezi 03d-scheduling-calendar.md).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `case_id` | UUID | FK → Case | NULL dacă consultație pre-dosar |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `notary_id` | UUID | FK → User, NOT NULL | |
| `room_resource_id` | UUID | FK → RoomResource | |
| `appointment_type` | ENUM | NOT NULL | `signing`, `consultation`, `document_verification`, `other` |
| `start_time` | TIMESTAMP | NOT NULL | |
| `end_time` | TIMESTAMP | NOT NULL | |
| `status` | ENUM | NOT NULL | `unconfirmed`, `confirmed`, `cancelled`, `rescheduled`, `completed`, `no_show` |
| `participants` | JSONB | | Array Person/Company IDs |
| `reminder_sent` | BOOLEAN | DEFAULT FALSE | |
| `reminder_sent_at` | TIMESTAMP | | |
| `notes` | TEXT | | |
| `created_by` | UUID | FK → User, NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_appointment_case_id` ON `case_id`
- `idx_appointment_office_id` ON `office_id`
- `idx_appointment_notary_id` ON `notary_id`
- `idx_appointment_start_time` ON `start_time` (for calendar queries)
- `idx_appointment_status` ON `status`

---

### 5.2.15. Invoice

**Facturi (vezi 03f-billing-accounting.md).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `case_id` | UUID | FK → Case | |
| `invoice_number` | VARCHAR(50) | NOT NULL | Ex: "2025-123" (unique per office per year) |
| `client_type` | ENUM | NOT NULL | `person`, `company` |
| `client_id` | UUID | NOT NULL | FK → Person OR Company |
| `issue_date` | DATE | NOT NULL | |
| `due_date` | DATE | NOT NULL | |
| `status` | ENUM | NOT NULL | `draft`, `issued`, `paid`, `partially_paid`, `cancelled`, `storno` |
| `line_items` | JSONB | NOT NULL | Array `[{"description": "...", "qty": 1, "price": 100, "total": 100}, ...]` |
| `subtotal` | DECIMAL(10,2) | NOT NULL | |
| `vat_rate` | DECIMAL(5,2) | DEFAULT 19.00 | % |
| `vat_amount` | DECIMAL(10,2) | NOT NULL | |
| `total` | DECIMAL(10,2) | NOT NULL | Subtotal + VAT |
| `currency` | VARCHAR(3) | DEFAULT 'RON' | |
| `payment_method` | ENUM | | `cash`, `card`, `bank_transfer`, `other` |
| `payment_date` | DATE | | |
| `payment_reference` | VARCHAR(255) | | Ex: nr. OP |
| `pdf_path` | TEXT | | S3/Blob path factură PDF |
| `storno_of_invoice_id` | UUID | FK → Invoice | Dacă e factură storno |
| `notes` | TEXT | | |
| `created_by` | UUID | FK → User, NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_invoice_office_id` ON `office_id`
- `idx_invoice_case_id` ON `case_id`
- `idx_invoice_number` ON `invoice_number`
- `idx_invoice_status` ON `status`
- `idx_invoice_issue_date` ON `issue_date`
- `idx_invoice_due_date` ON `due_date`

**Constraints:**
- `UNIQUE (office_id, invoice_number)`

---

### 5.2.16. Payment

**Înregistrare plăți factură (pentru plăți parțiale).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `invoice_id` | UUID | FK → Invoice, NOT NULL | |
| `amount` | DECIMAL(10,2) | NOT NULL | Sumă plătită |
| `payment_date` | DATE | NOT NULL | |
| `payment_method` | ENUM | NOT NULL | `cash`, `card`, `bank_transfer`, `other` |
| `payment_reference` | VARCHAR(255) | | |
| `notes` | TEXT | | |
| `recorded_by` | UUID | FK → User, NOT NULL | |
| `created_at` | TIMESTAMP | NOT NULL | |

**Indexes:**
- `idx_payment_invoice_id` ON `invoice_id`
- `idx_payment_date` ON `payment_date`

---

### 5.2.17. ConflictOfInterest

**Detectare conflicte interese (vezi 03a-core-case-management.md).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `case_id` | UUID | FK → Case, NOT NULL | Dosarul curent |
| `conflicting_case_id` | UUID | FK → Case | Dosar conflictual |
| `client_id` | UUID | NOT NULL | FK → Person OR Company (clientul comun) |
| `conflict_type` | ENUM | NOT NULL | `opposing_parties`, `same_transaction_both_sides`, `prior_representation`, `other` |
| `detected_at` | TIMESTAMP | NOT NULL | |
| `detected_by` | ENUM | | `system_auto`, `manual` |
| `resolution_status` | ENUM | NOT NULL | `pending`, `accepted_with_consent`, `refused`, `dismissed` |
| `resolution_notes` | TEXT | | |
| `consent_document_id` | UUID | FK → Document | Dacă accepted cu consimțământ scris |
| `resolved_by` | UUID | FK → User | |
| `resolved_at` | TIMESTAMP | | |
| `created_at` | TIMESTAMP | NOT NULL | |

**Indexes:**
- `idx_conflict_case_id` ON `case_id`
- `idx_conflict_conflicting_case_id` ON `conflicting_case_id`
- `idx_conflict_client_id` ON `client_id`
- `idx_conflict_resolution_status` ON `resolution_status`

---

### 5.2.18. PowerOfAttorney (Procură)

**Registru procuri (vezi 03a-core-case-management.md).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `case_id` | UUID | FK → Case | Dacă procură autentificată de birou |
| `repertory_entry_id` | UUID | FK → RepertoryEntry | Link la repertoriu |
| `grantor_type` | ENUM | NOT NULL | `person`, `company` |
| `grantor_id` | UUID | NOT NULL | Mandant |
| `grantee_type` | ENUM | NOT NULL | `person`, `company` |
| `grantee_id` | UUID | NOT NULL | Mandatar |
| `powers_description` | TEXT | NOT NULL | Descriere puteri (ex: "vânzare imobil") |
| `is_special` | BOOLEAN | NOT NULL | Specială (pt. act specific) vs. generală |
| `is_irrevocable` | BOOLEAN | DEFAULT FALSE | |
| `issue_date` | DATE | NOT NULL | |
| `expiry_date` | DATE | | NULL = fără termen |
| `status` | ENUM | NOT NULL | `active`, `revoked`, `expired`, `used` |
| `revoked_at` | DATE | | |
| `revocation_reason` | TEXT | | |
| `document_id` | UUID | FK → Document | PDF procură |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_poa_office_id` ON `office_id`
- `idx_poa_grantor_id` ON `grantor_id`
- `idx_poa_grantee_id` ON `grantee_id`
- `idx_poa_status` ON `status`
- `idx_poa_expiry_date` ON `expiry_date` (pentru detectare expirate)

---

### 5.2.19. Succession (Succesiune)

**Dosare succesiuni - workflow special (vezi 03a, Annex 10).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `case_id` | UUID | FK → Case, NOT NULL, UNIQUE | 1:1 cu Case |
| `deceased_person_id` | UUID | FK → Person, NOT NULL | De cuius |
| `death_date` | DATE | NOT NULL | |
| `death_certificate_number` | VARCHAR(100) | | |
| `has_will` | BOOLEAN | DEFAULT FALSE | Există testament? |
| `will_document_id` | UUID | FK → Document | |
| `estate_value_estimate` | DECIMAL(15,2) | | Estimare valoare patrimoniu |
| `workflow_stage` | ENUM | NOT NULL | `inventory`, `heirs_identification`, `acceptance_renunciation`, `partition`, `closed` |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_succession_case_id` ON `case_id`
- `idx_succession_deceased_id` ON `deceased_person_id`

---

### 5.2.20. Heir (Moștenitor)

**Moștenitori succesiune.**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `succession_id` | UUID | FK → Succession, NOT NULL | |
| `person_id` | UUID | FK → Person, NOT NULL | |
| `relationship_to_deceased` | ENUM | NOT NULL | `spouse`, `child`, `parent`, `sibling`, `other` |
| `inheritance_share` | VARCHAR(20) | | Ex: "1/4" |
| `acceptance_status` | ENUM | NOT NULL | `pending`, `accepted_pure`, `accepted_with_benefit_inventory`, `renounced` |
| `acceptance_date` | DATE | | |
| `acceptance_document_id` | UUID | FK → Document | |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_heir_succession_id` ON `succession_id`
- `idx_heir_person_id` ON `person_id`

---

### 5.2.21. Asset (Bun Succesoral)

**Bunuri inventariate în succesiune.**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `succession_id` | UUID | FK → Succession, NOT NULL | |
| `asset_type` | ENUM | NOT NULL | `real_estate`, `vehicle`, `bank_account`, `securities`, `personal_property`, `other` |
| `description` | TEXT | NOT NULL | Ex: "Apartament str. X nr. 1" |
| `location` | TEXT | | |
| `cadastral_number` | VARCHAR(50) | | Dacă imobil |
| `estimated_value` | DECIMAL(15,2) | | |
| `currency` | VARCHAR(3) | DEFAULT 'RON' | |
| `co_ownership_share` | VARCHAR(20) | | Ex: "1/1" (proprietate exclusivă de cuius) |
| `encumbrances` | TEXT | | Sarcini (ipoteci, gajuri) |
| `document_id` | UUID | FK → Document | Document justificativ |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | | |

**Indexes:**
- `idx_asset_succession_id` ON `succession_id`
- `idx_asset_type` ON `asset_type`

---

### 5.2.22. ActivityLog (Audit Trail)

**Log complet acțiuni (vezi 03g-compliance-audit.md).**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `user_id` | UUID | FK → User | NULL dacă system action |
| `action_type` | VARCHAR(100) | NOT NULL | Ex: `case.created`, `document.signed` |
| `entity_type` | VARCHAR(50) | | Ex: `Case`, `Document` |
| `entity_id` | UUID | | |
| `changes` | JSONB | | Diff before/after (pentru update-uri) |
| `ip_address` | VARCHAR(45) | | |
| `user_agent` | TEXT | | Browser info |
| `metadata` | JSONB | | Extra context |
| `timestamp` | TIMESTAMP | NOT NULL | |

**Indexes:**
- `idx_activity_log_office_id` ON `office_id`
- `idx_activity_log_user_id` ON `user_id`
- `idx_activity_log_entity` ON `entity_type, entity_id`
- `idx_activity_log_timestamp` ON `timestamp` (for date range queries)
- `idx_activity_log_action_type` ON `action_type`

**Special:** Table append-only (no UPDATE/DELETE allowed - trigger-based protection).

---

### 5.2.23. RoomResource (Săli/Resurse)

**Resurse programate (săli, notari) - pentru calendar.**

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | |
| `office_id` | UUID | FK → Office, NOT NULL | |
| `name` | VARCHAR(100) | NOT NULL | Ex: "Sala 1", "Sala semnări" |
| `type` | ENUM | NOT NULL | `room`, `other` |
| `capacity` | INTEGER | | Nr. persoane |
| `is_active` | BOOLEAN | DEFAULT TRUE | |
| `created_at` | TIMESTAMP | NOT NULL | |

**Indexes:**
- `idx_room_office_id` ON `office_id`

---

## 5.3. Supporting Tables

### 5.3.1. Template

**Template-uri documente.**

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `office_id` | UUID | FK → Office (NULL = system template) |
| `name` | VARCHAR(255) | NOT NULL |
| `category` | VARCHAR(100) | |
| `file_path` | TEXT | NOT NULL |
| `variables` | JSONB | Lista variabile `{{VAR}}` |
| `is_active` | BOOLEAN | DEFAULT TRUE |
| `created_at` | TIMESTAMP | NOT NULL |

---

### 5.3.2. EmailLog

**Tracking e-mail-uri trimise.**

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `office_id` | UUID | FK → Office |
| `recipient_email` | VARCHAR(255) | NOT NULL |
| `subject` | VARCHAR(255) | |
| `body` | TEXT | |
| `status` | ENUM | `sent`, `failed`, `bounced` |
| `sent_at` | TIMESTAMP | |
| `opened_at` | TIMESTAMP | |

---

### 5.3.3. SMSLog

**Tracking SMS-uri.**

| Field | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `office_id` | UUID | FK → Office |
| `recipient_phone` | VARCHAR(20) | NOT NULL |
| `message` | TEXT | |
| `status` | ENUM | `sent`, `failed`, `delivered` |
| `cost` | DECIMAL(6,4) | RON |
| `sent_at` | TIMESTAMP | |

---

## 5.4. Data Retention & Archival

**Conformitate Law 36/1995 (30 ani păstrare dosare):**

### Soft Delete Strategy

**Entități critice (Case, Document, RepertoryEntry):**
- NU se șterge fizic (hard delete)
- Field `deleted_at` (TIMESTAMP) → Soft delete
- Queries: `WHERE deleted_at IS NULL` (exclus deleted)

### Archival (după 30 ani)

**Job automat anual:**
1. Identifică dosare cu `closed_at` > 30 ani
2. Anonimizare date personale (GDPR):
   - CNP → hash
   - Nume → "Persoană Fizică A", "Persoană Fizică B"
   - Adresă → "Municipiu București"
3. Păstrare structură dosar + repertoriu (pentru statistici)
4. Mutare documente în Glacier storage (cost-efficient)

---

**[Next: System Architecture →](./06-system-architecture.md)**
