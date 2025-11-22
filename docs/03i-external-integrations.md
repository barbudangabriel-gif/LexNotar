# 3i. External Integrations

[← Înapoi la Overview](./03-functional-modules-overview.md) | [← Previous](./03h-e-signature-qes.md)

---

## Obiectiv

Integrări cu sisteme externe obligatorii pentru notariat: ANAF, ONRC, RAR, iNot, și alte servicii publice.

---

## 1. ANAF (Agenția Națională de Administrare Fiscală)

### Use Cases

**Verificări obligatorii înainte de autentificare:**
1. **Verificare CUI firmă** (pentru dosare cu persoane juridice)
2. **Verificare datorii fiscal** (client are datorii la buget?)
3. **Extras CF (Certificat Fiscal)** - necesar pentru unele tranzacții

---

### API ANAF - SPV (Spațiul Privat Virtual)

**Endpoint principal:** `https://webservicesp.anaf.ro`

**Autentificare:** Certificat digital (QES) sau API key (pentru queries publice)

---

### 1.1. Verificare CUI Firmă

**Use case:** Client SRL vrea să cumpere imobil → Verificăm dacă CUI-ul este valid și activ.

**API Call:**
```http
POST https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva
Content-Type: application/json

[
  {
    "cui": 12345678,
    "data": "2025-11-21"
  }
]
```

**Response:**
```json
{
  "cod": 200,
  "message": "SUCCESS",
  "found": [
    {
      "cui": 12345678,
      "data": "2025-11-21",
      "denumire": "SRL ALFA",
      "adresa": "Str. Exemplu, Nr. 1, București",
      "scpTVA": true,  // Plătitor TVA
      "data_inregistrare_ScpTVA": "2020-01-15",
      "stare": "ACTIVA"
    }
  ]
}
```

**LexNotar handling:**
1. Asistent: Adaugă parte PJ → Introduce CUI 12345678
2. Sistem: API call ANAF automat (background)
3. Dacă success:
   - Auto-populate: Denumire = "SRL ALFA", Adresă = "Str. Exemplu..."
   - Afișează badge: ✅ "CUI verificat ANAF - Activ"
4. Dacă firmă INACTIVĂ:
   - Alert: "⚠️ Atenție: Firma este INACTIVĂ în registrul ANAF"

---

### 1.2. Verificare Datorii Fiscale

**Use case:** Înainte de vânzare imobil, verificăm dacă vânzătorul (PF sau PJ) are datorii la ANAF.

**API Call:**
```http
POST https://webservicesp.anaf.ro/DetaliiSituatieFiscala
Content-Type: application/json
Authorization: Bearer {ANAF_TOKEN}

{
  "cui": "1234567890123"  // CNP pentru PF, CUI pentru PJ
}
```

**Response (exemplu cu datorii):**
```json
{
  "cui": "1234567890123",
  "denumire": "POPESCU ION",
  "datorii": [
    {
      "tip": "Impozit imobil",
      "suma": 500.00,
      "moneda": "RON",
      "termen": "2024-12-31"
    }
  ],
  "total_datorii": 500.00
}
```

**LexNotar handling:**
1. Dosar vânzare-cumpărare → Tab "Verificări" → Click "Verifică ANAF vânzător"
2. Sistem: API call
3. Dacă datorii > 0:
   - Warning: "🔴 Vânzător Popescu Ion are datorii ANAF: 500 RON (Impozit imobil)"
   - Task auto-generat: "Verifică dacă datoriile ANAF blochează tranzacția"
4. Dacă 0 datorii:
   - Badge: ✅ "Fără datorii ANAF"

---

## 2. ONRC (Oficiul Național al Registrului Comerțului)

### Use Cases

**Verificări pentru dosare cu firme:**
1. **Extras ONRC** (informații oficiale firmă: administratori, capital social, sediu)
2. **Certificat constatator** (document oficial pentru depunere la notar)

---

### API ONRC (Recom.ro sau servicii similare)

**Nota:** ONRC nu are API oficial public, dar există agregatori (ex: Recom.ro, OpenAPI.ro) care oferă date ONRC.

**Endpoint exemplu (Recom.ro):**
```http
GET https://api.recom.ro/v1/companies/{CUI}
Authorization: Bearer {API_KEY}
```

**Response:**
```json
{
  "cui": "12345678",
  "denumire": "SRL ALFA",
  "nr_reg_com": "J40/1234/2020",
  "capital_social": 200,
  "capital_social_varsat": 200,
  "data_infiintare": "2020-01-15",
  "stare": "ACTIVA",
  "sediu": {
    "judet": "București",
    "localitate": "Sector 1",
    "strada": "Strada Exemplu",
    "numar": "1"
  },
  "administratori": [
    {
      "nume": "Popescu Ion",
      "cnp": "1234567890123",
      "functie": "Administrator"
    }
  ],
  "cod_caen": [
    {
      "cod": "6201",
      "descriere": "Activități de realizare a soft-ului la comanda (software orientat client)"
    }
  ]
}
```

**LexNotar handling:**
1. Adaugă parte PJ → CUI 12345678
2. Click "Import ONRC"
3. Sistem: API call → Auto-populate toate datele (administratori, sediu, capital)
4. Afișează: "Date importate din ONRC la 21.11.2025 15:30"

---

### Certificat Constatator ONRC (Roadmap)

**Ideal:** Integrare directă cu ONRC pentru solicitare online certificat constatator.

**Realitate actuală (2025):** ONRC nu oferă API pentru solicitare, se face manual (portal ONRC sau fizic).

**Workaround LexNotar:**
- Task template: "Solicită certificat constatator ONRC pentru {FIRMA}"
- Asistent: Descarcă manual de pe portal ONRC → Upload în dosar LexNotar

---

## 3. RAR (Registrul Auto Român)

### Use Cases

**Verificări pentru dosare vânzare-cumpărare auto:**
1. **Verificare proprietar vehicul** (CNP proprietar = CNP vânzător?)
2. **Verificare gajuri/sarcini** pe vehicul
3. **Date tehnice vehicul** (marca, model, an fabricație)

---

### API RAR (Serviciul CarVertical sau similar)

**Nota:** RAR nu are API public, dar servicii third-party (CarVertical, AutoDNA) oferă date RAR.

**Endpoint exemplu:**
```http
GET https://api.carvertical.com/v1/reports/{VIN}
Authorization: Bearer {API_KEY}
```

**Response (simplificat):**
```json
{
  "vin": "WVWZZZ1KZBW000001",
  "marca": "Volkswagen",
  "model": "Golf",
  "an_fabricatie": 2020,
  "proprietar_curent": {
    "cnp": "1234567890123",
    "data_achizitie": "2022-05-10"
  },
  "gajuri": [],  // Array gol = fără gajuri
  "damage_history": [
    {
      "data": "2023-03-15",
      "tip": "Accident minor",
      "descriere": "Daună ușoară - reparată"
    }
  ]
}
```

**LexNotar handling:**
1. Dosar vânzare auto → Introduce VIN: WVWZZZ1KZBW000001
2. Sistem: API call RAR/CarVertical
3. Verificări automate:
   - ✅ Proprietar RAR (CNP 1234567890123) = Vânzător dosar? → OK
   - ✅ Gajuri: Array gol → OK
   - ⚠️ Accident minor 2023 → Notificare notar (informare cumpărător)
4. Afișează raport: "Vehicul verificat, fără gajuri, 1 incident minor în istoric"

---

## 4. iNot (Registrul Notarilor Publici)

### Use Cases

**iNot = Sistem informatic integrat al Uniunii Naționale a Notarilor Publici:**
1. **Înregistrare acte notariale** (repertoriu centralizat național)
2. **Verificare acte anterioare** (ex: verifică dacă un imobil are acte notariale anterioare)
3. **Raportări statistice** către UNNP

---

### API iNot (Ipotetic - Nu Există Încă Public)

**Status actual (2025):** iNot este în dezvoltare/pilot, nu are API public documentat.

**Flow ideal (viitor):**

**1. Înregistrare act în iNot după semnare:**
```http
POST https://api.inot.ro/v1/acts
Authorization: Bearer {NOTAR_CERT}
Content-Type: application/json

{
  "repertoriu_local": "2025/123",
  "data_act": "2025-11-21",
  "tip_act": "vanzare_cumparare_imobil",
  "valoare": 250000,
  "notar": {
    "numar_legitimatie": "BUC123",
    "nume": "Popescu Maria"
  },
  "parti": [
    {
      "tip": "vanzator",
      "cnp": "1234567890123",
      "nume": "Popescu Ion"
    },
    {
      "tip": "cumparator",
      "cnp": "9876543210987",
      "nume": "Ionescu Maria"
    }
  ],
  "obiect": "Apartament str. Exemplu nr. 1, București"
}
```

**Response:**
```json
{
  "inot_id": "INOT-2025-ABC123456",
  "status": "registered",
  "timestamp": "2025-11-21T16:00:00Z"
}
```

**LexNotar:** Salvează `inot_id` în Repertory entity → Dovada înregistrare națională.

---

**2. Verificare acte anterioare imobil:**
```http
GET https://api.inot.ro/v1/acts/search?adresa=Str.+Exemplu+1+Bucuresti
Authorization: Bearer {NOTAR_CERT}
```

**Response:**
```json
{
  "found": 2,
  "acte": [
    {
      "inot_id": "INOT-2020-XYZ789",
      "data": "2020-05-15",
      "tip": "vanzare_cumparare",
      "notar": "Ionescu Andrei - Notariat Cluj"
    },
    {
      "inot_id": "INOT-2015-DEF456",
      "data": "2015-03-10",
      "tip": "vanzare_cumparare",
      "notar": "Georgescu Ana - Notariat București"
    }
  ]
}
```

**Beneficiu:** Notar vede istoric complet acte notariale pe imobil (chain of title).

---

## 5. ANCPI (Agenția Națională de Cadastru și Publicitate Imobiliară)

### Use Cases

**Verificări imobile:**
1. **Extras CF (Carte Funciară)** - document esențial pentru vânzare-cumpărare
2. **Verificare sarcini** (ipoteci, interdicții, servituți)

---

### API ANCPI (Portal ECRIS)

**ECRIS = Sistemul Electronic de Carte Funciară**

**Autentificare:** Certificat digital notar + credențiale ANCPI

**Flow LexNotar:**
1. Dosar vânzare imobil → Tab "Extras CF"
2. Click "Solicită extras CF ANCPI"
3. **Form:**
   - Nr. Carte Funciară: 123456-C1-U1
   - Județ: București
4. **Sistem:** API call ANCPI → Solicitare extras
5. **ANCPI:** Generează PDF extras CF (3-5 minute)
6. **LexNotar:** Primește webhook → Download PDF → Store în dosar
7. **Parsing automat (OCR/AI):**
   - Identifică proprietar curent
   - Extrage sarcini (ipoteci, interdicții)
   - Alertă dacă sarcini: "⚠️ Ipotecă 50.000 EUR în favoarea Banca X"

---

## 6. e-Transport (Sistem ANAF pentru e-Facturi B2G)

### Use Case (Roadmap)

**e-Factura obligatorie (din 2024 în România pentru B2G, planificat B2B din 2025):**
- Notarii emit facturi → Trebuie transmise în RO e-Factura (SPV ANAF)

**Integrare LexNotar:**
1. Factură emisă în LexNotar → Status "Emis"
2. Sistem: Generează XML format e-Factura (UBL 2.1 sau CII)
3. API call ANAF e-Transport:
   ```http
   POST https://api.anaf.ro/efactura/v1/upload
   Content-Type: application/xml
   Authorization: Bearer {ANAF_TOKEN}
   
   <Invoice>...</Invoice>
   ```
4. ANAF: Validează XML → Return ID înregistrare
5. LexNotar: Salvează ID, marchează "Transmisă ANAF"

---

## 7. National Bank of Romania (BNR) - Curs Valutar

### Use Case

**Tranzacții cu valori în EUR/USD:**
- Client cumpără imobil 100.000 EUR
- Onorar calculat în EUR, dar factură în RON (folosind curs BNR oficial)

**API BNR:**
```http
GET https://www.bnr.ro/nbrfxrates.xml
```

**Response (XML):**
```xml
<DataSet>
  <Body>
    <Cube date="2025-11-21">
      <Rate currency="EUR">4.9500</Rate>
      <Rate currency="USD">4.5000</Rate>
    </Cube>
  </Body>
</DataSet>
```

**LexNotar:**
- Daily job: Fetch curs BNR → Store în DB
- La calcul onorar: Folosește curs zilei emiterii facturii

---

## 8. SMS Gateway (Twilio / Local Providers)

### Use Cases

**SMS notificări:**
1. **Reminder programări** (cu 24h înainte)
2. **OTP autentificare** (2FA login portal client)
3. **Notificări urgente** (ex: "Document gata pentru ridicare")

**Provider recomandat România:** Twilio, SMSLink.ro, LabsMobile

**API Call (Twilio):**
```http
POST https://api.twilio.com/2010-04-01/Accounts/{ACCOUNT_SID}/Messages.json
Authorization: Basic {BASE64(ACCOUNT_SID:AUTH_TOKEN)}
Content-Type: application/x-www-form-urlencoded

From=+40722123456&To=+40733987654&Body=Reminder: Programare notariat maine 21.11 ora 10:00
```

**Cost:** ~0.05 RON/SMS

---

## 9. E-mail Service (SendGrid / Mailgun / AWS SES)

### Use Cases

**E-mail transactional:**
- Facturi (PDF attachment)
- Notificări status dosar
- Invitații semnare QES
- GDPR access requests response

**Provider recomandat:** SendGrid, AWS SES (cost-efficient, reliable)

**Configurare LexNotar:**
- SMTP settings în admin panel
- Template e-mail-uri (cu variabile)
- Tracking: Open rate, Click rate (pentru știut dacă client a primit)

---

## 10. Cloud Storage (AWS S3 / Azure Blob)

### Use Case

**Documente & backup:**
- Upload documente dosare → S3/Blob
- Backup nightly DB → S3 Glacier (long-term, ieftin)

**Buckets structure:**
```
lexnotar-documents/
  office_{OFFICE_ID}/
    case_{CASE_ID}/
      doc_{DOC_ID}_filename.pdf
      doc_{DOC_ID}_filename_signed.pdf

lexnotar-backups/
  db/
    2025-11-21_full.sql.gz
  documents/
    2025-11-21_incremental.tar.gz
```

**Lifecycle policies:**
- Documents: Standard storage (frequent access)
- Backups > 30 days: Glacier (cheap long-term)

---

## Integration Dashboard (Admin View)

### Status Integrări

**Verificare health integrations:**

| Service | Status | Last Check | Actions |
|---|---|---|---|
| ANAF API | ✅ Online | 21.11.2025 15:45 | Test |
| ONRC (Recom) | ✅ Online | 21.11.2025 15:45 | Test |
| RAR (CarVertical) | ⚠️ Slow (3s) | 21.11.2025 15:40 | Test |
| QES (Certinomis) | ✅ Online | 21.11.2025 15:45 | Test |
| SMS (Twilio) | ✅ Online | 21.11.2025 15:30 | Send Test SMS |
| E-mail (SendGrid) | ✅ Online | 21.11.2025 15:30 | Send Test Email |
| S3 Storage | ✅ Online | 21.11.2025 15:45 | - |

**Alert dacă service down:** E-mail către administrator + fallback (ex: dacă ANAF down, permite skip verificare cu warning).

---

## API Rate Limits & Caching

### Problema

**API-uri externe au rate limits:**
- ANAF: Max 100 requests/min
- ONRC (Recom): Max 1000 requests/day

### Soluție: Caching

**Redis cache:**
- CUI verificat → Cache rezultat 24h (dacă firmă activă, info nu se schimbă des)
- Curs BNR → Cache zilnic (se actualizează o dată pe zi)

**Exemplu:**
1. Asistent: Verifică CUI 12345678
2. LexNotar: Check Redis → Cache hit → Return date cached (fără API call)
3. Dacă cache miss → API call ANAF → Store în Redis (TTL 24h)

---

**[← Înapoi la Functional Modules Overview](./03-functional-modules-overview.md)**
