# 3f. Billing & Accounting

[← Înapoi la Overview](./03-functional-modules-overview.md) | [← Previous](./03e-tasks-workflow.md) | [Next →](./03g-compliance-audit.md)

---

## Obiectiv

Gestionarea financiară: calcul onorarii notariale (conform OUG 119/2022), facturare, tracking plăți, rapoarte contabile.

---

## Entitate: Invoice

**Date principale:**
- Case ID (dosar asociat)
- Invoice Number (auto-increment per an: 2025-001, 2025-002, etc.)
- Client: Person/Company ID (cine plătește)
- Issue Date
- Due Date (ex: +14 zile de la emitere)
- Status: Draft, Emis, Plătit, Parțial plătit, Anulat, Storno
- Line Items: Array de servicii facturate
  - Descriere (ex: "Onorar notarial vânzare-cumpărare imobil")
  - Cantitate (de obicei 1)
  - Preț unitar
  - Total linie
- Subtotal (suma line items)
- TVA (19% în România pentru servicii notariale)
- Total cu TVA
- Payment Method: Numerar, Card, Transfer bancar, OP (Ordin de plată)
- Payment Date (când a fost plătit efectiv)
- Payment Reference (ex: nr. OP, tranzacție card)
- Notes (ex: "Plata în 2 tranșe")
- PDF Path (link către PDF factură generat)

---

## Calcul Onorar Notarial (OUG 119/2022)

### Context Legislativ

**OUG 119/2022** stabilește tarifele notariale în România:
- **Tarife fixe** pentru anumite acte (ex: procuri, autentificări semnături)
- **Tarife proporționale** calculate pe valoarea bunului/contractului (ex: vânzare-cumpărare)
- **Tarife progresive pe tranșe** pentru valori mari

---

### Exemplu: Vânzare-Cumpărare Imobil

**Valoare imobil:** 250.000 RON

**Calcul conform OUG 119/2022 (tarif proporțional pe tranșe):**

| Tranșă valoare | Tarif |
|---|---|
| 0 - 30.000 RON | 1% |
| 30.001 - 60.000 RON | 0.5% |
| 60.001 - 600.000 RON | 0.3% |
| 600.001+ RON | 0.1% |

**Calcul pentru 250.000 RON:**
- Tranșa 1: 30.000 × 1% = 300 RON
- Tranșa 2: 30.000 × 0.5% = 150 RON
- Tranșa 3: 190.000 × 0.3% = 570 RON
- **Total onorar:** 300 + 150 + 570 = **1.020 RON**

**+ TVA 19%:** 1.020 × 1.19 = **1.213,80 RON** (total de plată)

---

### Tarife Fixe (Exemple)

**Conform OUG 119/2022:**
- **Procură autentificată:** 40 RON + TVA
- **Autentificare semnătură:** 20 RON + TVA
- **Traducere legalizată:** 15 RON/pagină + TVA
- **Copie legalizată:** 5 RON/pagină + TVA

**Notă:** Tarifele sunt minimale, notarul poate aplica tarif negociat cu clientul (mai mare), dar nu sub minim legal.

---

### Motor Calcul Onorar în LexNotar

**Input:**
- Tip act: Select din dropdown (Vânzare-cumpărare, Procură, Donație, etc.)
- Valoare (dacă aplicabil): 250.000 RON
- Tip calcul: Proporțional / Fix

**Sistem:**
1. Identifică regula de calcul pentru tipul de act (stocat în bază de date sau config)
2. Aplică formula tranșe (dacă proporțional)
3. Calculează onorar brut
4. Adaugă TVA 19%
5. Afișează: "Onorar calculat: 1.020 RON + TVA = **1.213,80 RON**"

**Override manual:**
- Notar poate edita manual suma (ex: tarif negociat cu client)
- Sistem afișează warning dacă sub tarif minim: "⚠️ Tarif sub minimul legal (1.020 RON)"

---

## Creare Factură

### Flow Standard

1. **Dosar #123** → Status "Pentru facturare"
2. **Contabil/Asistent:** Tab "Facturare" → "Creare factură"
3. **Form pre-populat:**
   - Client: Popescu Ion (auto-populate din părțile dosarului)
   - Line item 1: "Onorar notarial vânzare-cumpărare imobil (valoare 250.000 RON)" - **1.020 RON**
   - Line item 2: "Copii legalizate (3 pagini)" - **15 RON**
   - Subtotal: 1.035 RON
   - TVA 19%: 196,65 RON
   - **Total:** 1.231,65 RON
4. **Salvare:** Factură status "Draft"

---

### Generare PDF Factură

**Trigger:** Contabil click "Emite factură"

**Sistem:**
1. Validare date (client complet, line items, total > 0)
2. Generare PDF conform legislație fiscală română:
   - Header: Date notariat (nume, CUI, nr. înregistrare Camera Notarilor, adresă, telefon)
   - Date client (nume/denumire, CNP/CUI, adresă)
   - Tabel line items
   - Subtotal, TVA, Total
   - Informații plată: IBAN notariat
   - Footer: "Factură emisă conform OUG 119/2022. Se încasează de către notar public {NUME_NOTAR}"
3. Salvare PDF în storage (S3/Azure Blob)
4. Marcare factură status "Emis"
5. Trimitere automată PDF către client (e-mail)

---

### Template Factură (PDF)

**Sistem de template-uri similar cu documentele notariale:**
- Template default: `invoice_template_ro.docx` (sau HTML pentru generare PDF direct)
- Variabile: `{{INVOICE_NUMBER}}`, `{{CLIENT_NAME}}`, `{{TOTAL_AMOUNT}}`, etc.
- Generate PDF folosind librărie (ex: wkhtmltopdf, Puppeteer, sau .NET PDF libraries)

---

## Înregistrare Plăți

### Flow Plată Numerare

1. **Client:** Vine la birou, plătește 1.231,65 RON cash
2. **Contabil:** Factură #2025-123 → "Înregistrează plată"
   - Metodă: Numerar
   - Sumă: 1.231,65 RON
   - Data: 21.11.2025
   - Referință: "-"
3. **Salvare:** Factură status "Plătit", timestamp payment

**Bonus:** Sistem generează chitanță (receipt) automat, printabilă.

---

### Flow Plată Transfer Bancar

1. **Client:** Face transfer bancar pe IBAN notariat
2. **Contabil:** Verifică extrasul de cont, identifică tranzacția
3. **LexNotar:** Factură #2025-123 → "Înregistrează plată"
   - Metodă: Transfer bancar
   - Sumă: 1.231,65 RON
   - Data: 20.11.2025
   - Referință: "OP-ABC123" (nr. tranzacție bancară)
4. **Salvare:** Factură status "Plătit"

---

### Plată Parțială

**Use case:** Valoare mare, client plătește în 2 tranșe.

**Exemplu:**
- Total factură: 5.000 RON
- Plată 1: 3.000 RON (20.11.2025, Numerar)
- Plată 2: 2.000 RON (25.11.2025, Transfer)

**Sistem:**
- După plată 1 → Status "Parțial plătit", sold rămas: 2.000 RON
- După plată 2 → Status "Plătit"

**UI Facturare:**
```
Factură #2025-125
Total: 5.000 RON
Plătit: 3.000 RON
Sold rămas: 2.000 RON

Istoric plăți:
- 20.11.2025: 3.000 RON (Numerar)
```

---

## Facturi Storno/Anulare

### Storno (Reverse Invoice)

**Use case:** Factură emisă greșit, trebuie anulată.

**Flow:**
1. **Contabil:** Factură #2025-123 → "Storno"
2. **Sistem:**
   - Marchează factură originală status "Storno"
   - Creează factură storno #2025-123-S cu valori negative (ex: -1.231,65 RON)
   - Generează PDF factură storno
3. **Rezultat:** Factură originală anulată contabil, sold client = 0

**Legislație:** Conform legislației fiscale române, facturile nu se șterge, se anulează prin storno.

---

### Anulare (Simplă)

**Use case:** Factură în status "Draft", nu a fost încă emisă.

**Flow:** Contabil → "Șterge factură draft" → Confirmare → Factură ștearsă din sistem.

---

## Rapoarte Financiare

### Raport Încasări

**Filtru:**
- Perioadă: 01.11.2025 - 30.11.2025
- Notar: Toți / Maria
- Tip act: Toate / Vânzare-cumpărare

**Output:**
| Factură | Client | Data emitere | Data plată | Suma | Metodă |
|---|---|---|---|---|---|
| 2025-120 | Popescu Ion | 05.11 | 05.11 | 1.231,65 | Numerar |
| 2025-121 | SRL Alfa | 10.11 | 12.11 | 850,00 | Transfer |
| 2025-122 | Ionescu Maria | 15.11 | - | 500,00 | - (Neplătit) |
| ... | ... | ... | ... | ... | ... |

**Total încasat:** 45.000 RON
**Total de încasat:** 3.500 RON (facturi emise, neplătite)

---

### Raport Onorarii per Tip Act

**Use case:** Notar vrea să vadă ce tipuri de acte generează cel mai mult venit.

**Output:**
| Tip act | Nr. acte | Onorar total | Onorar mediu |
|---|---|---|---|
| Vânzare-cumpărare | 15 | 18.000 RON | 1.200 RON |
| Procură | 45 | 1.800 RON | 40 RON |
| Donație | 5 | 2.500 RON | 500 RON |
| Constituire SRL | 3 | 3.000 RON | 1.000 RON |

**Insight:** "Vânzare-cumpărare generează 70% din venit."

---

### Raport Clienți Restanți (Aging Report)

**Lista clienți cu facturi neplătite, sortată după vechime:**

| Client | Factură | Suma | Zile restante | Status |
|---|---|---|---|---|
| SRL Beta | 2025-100 | 5.000 RON | 45 zile | 🔴 Critic |
| Popescu Vasile | 2025-110 | 800 RON | 20 zile | 🟡 Atenție |
| Ionescu Maria | 2025-122 | 500 RON | 5 zile | 🟢 Nou |

**Acțiuni:**
- Notificare automată client la 7 zile, 14 zile, 30 zile de la emitere
- Generare scrisoare de somație (după 30 zile)

---

## Integrare Contabilitate Externă

### Export Date pentru Contabil Extern

**Use case:** Birouri mici - contabilul este extern (nu folosește LexNotar).

**Flow:**
1. **Contabil extern:** Cere raport lunar
2. **Administrator LexNotar:** Rapoarte → "Export facturi luna noiembrie"
3. **Format export:**
   - **CSV:** Pentru import în Excel
   - **XML (e-Factura):** Pentru ANAF (dacă aplicabil - notarii pot avea obligație e-factura pentru clienți PJ)
   - **PDF consolidat:** Toate facturile lunii într-un singur ZIP

---

### Integrare Software Contabilitate (Roadmap)

**Targeturi:**
- **Saga**, **Ciel**, **WizOne**, **SmartBill** (software-uri contabilitate populare în RO)

**API Integration:**
- LexNotar → API call către software contabilitate
- Sincronizare automată facturi (creare, plăți, storno)

**Beneficiu:** Elimină double-entry, contabilul vede facturile direct în sistemul său.

---

## Notificare Client - Factură Emisă

### E-mail Automat

**Trigger:** Factură trece în status "Emis"

**Conținut:**
```
Subiect: Factura #{INVOICE_NUMBER} - {NOTARIAT_NAME}

Bună ziua {CLIENT_NAME},

Vă transmitem factura pentru serviciile notariale prestate în dosarul #{CASE_NUMBER}.

Detalii factură:
- Număr: {INVOICE_NUMBER}
- Data: {ISSUE_DATE}
- Total de plată: {TOTAL_AMOUNT} RON
- Termen plată: {DUE_DATE}

Vă rugăm să efectuați plata prin:
- Numerar la sediul notariatului
- Transfer bancar: IBAN {IBAN}, Beneficiar: {NOTARIAT_NAME}

Factură PDF atașată.

Cu stimă,
{NOTARIAT_NAME}
```

**Attachment:** `Factura-2025-123.pdf`

---

## Setări Facturare (per Office)

### Configurare Biroul

**Administrator:** Setări → Facturare

**Date necesare:**
- **Date fiscale:**
  - Denumire notariat (ex: "Cabinet Notarial Maria Popescu")
  - CUI (Cod Unic Înregistrare)
  - Nr. înregistrare Camera Notarilor Publici București
  - Adresă fiscală
  - IBAN
  - Banca
- **Setări facturare:**
  - TVA aplicabil: Da/Nu (implicit Da - 19%)
  - Serie facturi: 2025- (auto-increment)
  - Termene plată default: 14 zile
  - Limba factură: Română / Engleză (pentru clienți străini)
- **Tarifar:**
  - Import tarifar OUG 119/2022 (template sistem)
  - Posibilitate override/personalizare (ex: tarife negociate pentru clienți corporativi)

---

## Multi-Currency Support (Roadmap - International)

### Use Case

**Birou în zona de frontieră / clienți străini:**
- Valoare imobil: 50.000 EUR
- Onorar calculat în EUR
- Conversie la RON pentru factură (folosind curs BNR la data emiterii)

**Factură:**
```
Onorar notarial: 500 EUR (echivalent 2.475 RON la curs 4.95)
TVA 19%: 95 EUR (echivalent 470,25 RON)
Total: 595 EUR (echivalent 2.945,25 RON)
```

**Plată:** Client poate plăti în EUR sau RON.

---

**[Next: Compliance & Audit →](./03g-compliance-audit.md)**
