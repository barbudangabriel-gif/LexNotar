# 3h. E-Signature & QES Integration

[← Înapoi la Overview](./03-functional-modules-overview.md) | [← Previous](./03g-compliance-audit.md) | [Next →](./03i-external-integrations.md)

---

## Obiectiv

Integrare semnătură electronică calificată (QES - Qualified Electronic Signature) conform eIDAS pentru autentificare acte notariale.

---

## Context Legal: eIDAS & QES

### eIDAS Regulation (EU 910/2014)

**Trei niveluri semnături electronice:**
1. **SES (Simple Electronic Signature):** Click "Accept" (valoare juridică limitată)
2. **AES (Advanced Electronic Signature):** Linked to signer, detect tampering
3. **QES (Qualified Electronic Signature):** Certificat calificat + dispozitiv securizat → **Echivalent semnătură olografă**

**Pentru acte notariale:** Obligatoriu **QES** (conform Law 36/1995 + eIDAS).

---

### QES în România

**Providers acreditați (TSP - Trust Service Providers):**
- **Certinomis** (Orange Business Services)
- **Namirial** (ex-Bit4id)
- **DocuSign** (prin parteneri locali cu certificare eIDAS)
- **InfoCert**

**Cerințe:**
- Certificat calificat emis de CA (Certification Authority) acreditată
- Dispozitiv securizat: Smart card, USB token (ex: Gemalto), sau Remote signing (HSM cloud)

---

## Arhitectură Integrare QES

### Flow Semnare Remotă (Remote Signing - Recomandat)

**Beneficii:**
- Client semnează de acasă (nu trebuie să vină la birou cu smart card)
- Notar folosește HSM cloud (fără USB token fizic)

**Flow:**
1. **LexNotar:** Document gata semnare → "Trimite pentru semnare QES"
2. **API call către TSP** (ex: Certinomis API):
   - Upload document PDF
   - Specificare semnatari: [Popescu Ion - CNP 1234567890123, Ionescu Maria - CNP 9876543210987]
3. **TSP:** Trimite SMS/E-mail către fiecare semnatar:
   - "Click link pentru semnare document notarial"
4. **Semnatar:** Click link → Autentificare (CNP + OTP SMS)
5. **TSP:** Afișează preview document → Semnatar confirmă "Semnez"
6. **TSP:**
   - Aplică semnătură QES (folosind certificatul calificat al semnatarului, stocat în HSM)
   - Aplică timestamp RFC 3161 (dovada momentului semnării)
   - Return document semnat (PDF cu semnături embedate)
7. **LexNotar:** Primește webhook notification → Download document semnat → Store în dosar

---

### Alternative: Semnare la Birou (Local Signing)

**Flow:**
1. **Client:** Vine la birou cu smart card + cititor
2. **Asistent:** Conectează cititor la PC → Open document în LexNotar
3. **LexNotar:** Integrare cu driver smart card (ex: PKCS#11)
4. **Client:** Introduce PIN smart card
5. **Sistem:** Aplică semnătură QES local → Document semnat
6. **Store:** Document salvat în dosar

**Dezavantaj:** Client trebuie să vină fizic (mai puțin flexibil).

---

## Entitate: Signature

**Date stocate per semnătură:**
- Document ID (documentul semnat)
- Signer: Person ID (cine a semnat)
- Signature Type: QES / AES / SES
- Timestamp: Data/ora semnării (ISO 8601)
- Certificate Info:
  - Issuer: "Certinomis CA"
  - Serial Number: "ABC123456"
  - Valid From / Valid To
- TSP (Trust Service Provider): "Certinomis", "Namirial", etc.
- Status: Pending, Signed, Rejected, Expired
- Signature Position: Coordonate în PDF (x, y, page) - pentru vizualizare
- Validation Status: Valid / Invalid / Revoked (verificat periodic)

---

## Multi-Party Signing (Semnare Multiplă)

### Use Case: Vânzare-Cumpărare

**Semnatari:**
1. Vânzător: Popescu Ion
2. Cumpărător: Ionescu Maria
3. Notar: Maria Notarul (autentificare act)

**Flow secvențial:**
1. **LexNotar:** Creare signing session cu 3 semnatari (ordine: Vânzător → Cumpărător → Notar)
2. **TSP:** Trimite invitație semnare către Popescu Ion
3. **Popescu:** Semnează → Document parțial semnat (1/3)
4. **TSP:** Trimite invitație către Ionescu Maria
5. **Ionescu:** Semnează → Document parțial semnat (2/3)
6. **TSP:** Trimite invitație către Notar Maria
7. **Notar:** Semnează → **Document final semnat complet (3/3)**
8. **LexNotar:** Primește document final → Status dosar "Signed" → Înregistrare în Repertoriu

---

### Flow Paralel (Opțional)

**Scenarii fără dependențe:** Toți semnatarii primesc invitația simultan, semnează în ordinea în care procesează (ex: procuri simple).

---

## Signing Dashboard

### View Notar: "Documente Așteptând Semnare"

**Listă:**
| Dosar | Document | Semnatari | Status | Acțiune |
|---|---|---|---|---|
| #123 | Act vânzare | Popescu (✅), Ionescu (⏳), Notar (⏳) | 1/3 semnat | Vezi |
| #125 | Procură | Client A (⏳) | 0/1 semnat | Reminder |
| #130 | Donație | Client B (❌ Refuzat) | - | Retrimitere |

**Acțiuni:**
- **Vezi:** Deschide document preview + status detaliat semnături
- **Reminder:** Retrimite SMS/E-mail semnatar (dacă > 24h fără răspuns)
- **Anulează:** Cancel signing session (dacă client renunță)

---

## Signature Validation (Verificare Validitate)

### Verificare Imediată (Post-Signing)

**Trigger:** După primirea documentului semnat de la TSP

**Verificări automate:**
1. **Certificate valid?** Verifică în lista CA-urilor eIDAS trusted
2. **Certificate revoked?** Check OCSP (Online Certificate Status Protocol) / CRL (Certificate Revocation List)
3. **Timestamp valid?** Verifică timestamp-ul TSA (Time Stamping Authority)
4. **Document intact?** Hash-ul documentului = hash-ul semnat (detect tampering)

**Rezultat:**
- ✅ Toate verificări OK → Signature status "Valid"
- ❌ Orice fail → Signature status "Invalid" + Alert către notar

---

### Verificare Periodică (Long-Term Validation)

**Problema:** Certificatul QES expiră (ex: după 3 ani), dar documentul trebuie valid 30 ani.

**Soluție: Long-Term Validation (LTV) conform eIDAS:**
1. **La semnare:** TSP aplică timestamp + certificat chain
2. **Anual (job automat):** LexNotar re-validează semnătura:
   - Verifică certificat (chiar dacă expirat, era valid la data semnării - dovada = timestamp)
   - Dacă certificat aproape de expirare → Aplică **counter-timestamp** (nou timestamp care atestă că semnătura veche era validă)
3. **Rezultat:** Document rămâne valid peste expirarea certificatului

---

## Provider Integration - API Examples

### Certinomis API (Exemplu)

**1. Inițiere Signing Session**

```http
POST https://api.certinomis.com/v1/signing-sessions
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "document": {
    "name": "Act_vanzare_cumpararare_Popescu_Ionescu.pdf",
    "content": "{BASE64_ENCODED_PDF}"
  },
  "signers": [
    {
      "name": "Popescu Ion",
      "identifier": "1234567890123",  // CNP
      "identifier_type": "ro_cnp",
      "email": "popescu@example.com",
      "phone": "+40722123456",
      "signature_position": {
        "page": 5,
        "x": 100,
        "y": 700
      }
    },
    {
      "name": "Ionescu Maria",
      "identifier": "9876543210987",
      "email": "ionescu@example.com",
      "phone": "+40733987654",
      "signature_position": {
        "page": 5,
        "x": 350,
        "y": 700
      }
    }
  ],
  "callback_url": "https://lexnotar.ro/api/webhooks/certinomis",
  "workflow": "sequential"  // sau "parallel"
}
```

**Response:**
```json
{
  "session_id": "sess_abc123",
  "status": "pending",
  "signing_links": {
    "1234567890123": "https://sign.certinomis.com/sess_abc123/signer1",
    "9876543210987": "https://sign.certinomis.com/sess_abc123/signer2"
  }
}
```

---

**2. Webhook Notification (Semnătar a Semnat)**

```http
POST https://lexnotar.ro/api/webhooks/certinomis
Content-Type: application/json

{
  "event": "signer.signed",
  "session_id": "sess_abc123",
  "signer_identifier": "1234567890123",
  "signed_at": "2025-11-21T15:30:00Z",
  "status": "partially_signed",  // 1/2 semnatari
  "pending_signers": ["9876543210987"]
}
```

**LexNotar handling:**
- Update Signature entity: Status "Signed" pentru Popescu
- Notificare în app: "Popescu Ion a semnat actul"

---

**3. Webhook Final (Toate Semnăturile Complete)**

```http
POST https://lexnotar.ro/api/webhooks/certinomis
Content-Type: application/json

{
  "event": "session.completed",
  "session_id": "sess_abc123",
  "signed_document_url": "https://api.certinomis.com/v1/documents/doc_xyz789",
  "signed_at": "2025-11-21T16:00:00Z",
  "signatures": [
    {
      "signer": "1234567890123",
      "certificate_serial": "CERT123",
      "timestamp": "2025-11-21T15:30:00Z"
    },
    {
      "signer": "9876543210987",
      "certificate_serial": "CERT456",
      "timestamp": "2025-11-21T16:00:00Z"
    }
  ]
}
```

**LexNotar handling:**
1. Download signed PDF de la URL
2. Store în S3/Blob → Update Document entity cu path-ul
3. Validate signatures (OCSP check)
4. Update Case status → "Signed"
5. Trigger: Creare entry Repertoriu Notarial
6. Notificare notar: "Dosar #123 semnat complet"

---

## Signature Refusal (Client Refuză Semnarea)

**Flow:**
1. **Client:** Primește link semnare → Citește document → Click "Refuz să semnez"
2. **TSP:** Webhook către LexNotar:
   ```json
   {
     "event": "signer.rejected",
     "session_id": "sess_abc123",
     "signer_identifier": "9876543210987",
     "reason": "Nu sunt de acord cu clauzele"
   }
   ```
3. **LexNotar:**
   - Update Signature status: "Rejected"
   - Notificare notar: "⚠️ Ionescu Maria a refuzat semnarea actului (Dosar #123)"
   - Task auto-generat: "Contactează client Ionescu pentru clarificări"

---

## Signature Expiry (Timeout)

**Scenario:** Client nu semnează în 7 zile → Signing session expiră.

**Flow:**
1. **TSP:** După 7 zile → Expire session → Webhook:
   ```json
   {
     "event": "session.expired",
     "session_id": "sess_abc123"
   }
   ```
2. **LexNotar:**
   - Update Signature status: "Expired"
   - Notificare asistent: "Signing session expirat pentru Dosar #123"
   - Task: "Retrimitere invitație semnare sau reprogramare întâlnire"

---

## Signature Appearance (Vizualizare Semnătură în PDF)

### Visual Signature Block

**Când semnatar semnează, TSP adaugă un bloc vizibil în PDF:**

```
┌─────────────────────────────────────┐
│ Semnat electronic de:               │
│ Popescu Ion                         │
│ CNP: 1234567890123                  │
│ Data: 21.11.2025 15:30:22           │
│ Certificat: Certinomis #ABC123      │
│ [QR Code pentru verificare]         │
└─────────────────────────────────────┘
```

**Beneficii:**
- Client vede clar semnăturile pe document (ca pe hartie)
- QR code → Link verificare semnătură online (pe site TSP)

---

### Configurare Poziție Semnătură

**Administrator LexNotar:** Template-uri → Edit template "Act vânzare-cumpărare"

**Definire zone semnături:**
- **Pagina 5:**
  - Zona 1 (Vânzător): x=100, y=700, width=200, height=80
  - Zona 2 (Cumpărător): x=350, y=700, width=200, height=80
  - Zona 3 (Notar): x=225, y=600, width=200, height=80 (centrat, sub părți)

**La generare document:** Sistem plaseaza placeholder-e în zonele definite, TSP le înlocuiește cu semnături reale.

---

## Bulk Signing (Semnare în Lot - pentru Notar)

### Use Case

**Notar:** Are 20 dosare gata semnare, vrea să semneze toate odată (în loc de 20 signing sessions separate).

**Flow:**
1. **Notar:** Dashboard → Select 20 dosare → "Semnare lot"
2. **LexNotar:**
   - Creează 20 signing sessions la TSP
   - Semnatar comun: Notar Maria (CNP notar)
3. **Notar:** Primește 1 SMS cu OTP
4. **TSP:** Prezintă lista: "20 documente de semnat. Confirmă?"
5. **Notar:** Confirmă → Introduce PIN/OTP → Toate semnate simultan
6. **LexNotar:** Primește 20 webhooks → Update toate dosarele

**Beneficiu:** Eficiență - notar semnează 20 acte în 2 minute (vs. 40 minute dacă individual).

---

## Costuri QES

### Model Pricing TSP

**Certinomis (exemplu):**
- **Setup:** 0 RON (API integration gratuită)
- **Per semnătură:** 2-5 RON/semnătură (variază în funcție de volum)
- **Certificat calificat remote:** 300 RON/an per user (notar)
- **SMS OTP:** 0.05 RON/SMS

**Calcul pentru 100 acte/lună:**
- 100 acte × 3 semnatari (2 părți + notar) = 300 semnături
- 300 × 3 RON = **900 RON/lună**
- + 300 RON/an certificat notar = 25 RON/lună
- **Total: ~925 RON/lună** (pentru 100 acte)

**Inclus în pricing LexNotar:** Da, cost QES parte din subscription (sau pay-per-use pentru plan entry-level).

---

## Fallback: Semnare Fizică (Hybrid Mode)

### Scenario

**Client fără smartphone/e-mail:** Nu poate semna remote QES.

**Flow:**
1. **Sistem:** Detectează la creare dosar: "Client nu are e-mail/telefon" → Flag "Physical signing required"
2. **Asistent:** Programează întâlnire la birou
3. **La birou:** Client semnează pe hârtie + Notar scanează act semnat → Upload în LexNotar
4. **Document:** Marcat "Physical signature" (nu QES)

**Notă:** În România, notarii acceptă încă semnături fizice (cerneală + ștampilă). QES este opțional dar recomandat (eficiență).

---

## Signature Audit Trail

**Toate acțiunile legate de semnături în audit log:**

```json
{
  "action_type": "signature.session_created",
  "case_id": "123",
  "document_id": "doc_789",
  "tsp": "Certinomis",
  "signers": ["1234567890123", "9876543210987"],
  "created_by": "user_456"
}

{
  "action_type": "signature.signed",
  "session_id": "sess_abc123",
  "signer_cnp": "1234567890123",
  "timestamp": "2025-11-21T15:30:00Z",
  "certificate_serial": "ABC123"
}

{
  "action_type": "signature.validated",
  "document_id": "doc_789",
  "validation_result": "valid",
  "validated_at": "2025-11-21T16:05:00Z"
}
```

---

**[Next: External Integrations →](./03i-external-integrations.md)**
