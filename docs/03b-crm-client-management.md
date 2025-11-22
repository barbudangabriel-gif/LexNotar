# 3b. CRM & Client Management

[← Înapoi la Overview](./03-functional-modules-overview.md) | [← Previous](./03a-core-case-management.md) | [Next →](./03c-document-automation.md)

---

## Entitatea Centrală: Client

Baza de date centralizată cu toți clienții (persoane fizice și juridice).

---

## Fișă Client

### Tipuri

**Persoană Fizică (PF):**
- Nume, Prenume
- CNP (unic în sistem per tenant)
- Date CI: Serie, Număr, Eliberat de, Valabil până la
- Data nașterii (derivată din CNP, validare automată)
- Adresă domiciliu/reședință
- Telefon, E-mail
- Stare civilă: Necăsătorit, Căsătorit, Divorțat, Văduv

**Persoană Juridică (PJ):**
- Denumire
- CUI (unic în sistem per tenant)
- Nr. Reg. Com.
- Sediu social (adresă completă)
- Reprezentant legal (link la altă fișă Client PF sau date inline)
- Telefon, E-mail
- Status: Activ, Radiat, Dizolvat, În insolvență

---

## Date Suplimentare

### Categorii
- **Client nou** (primul dosar)
- **Client recurent** (2+ dosare)
- **Client VIP** (marcat manual de notar/asistent)

### Flag-uri
- 🚩 **Risc AML:** Tranzacții suspecte anterioare, necesită atenție sporită
- ⚠️ **Documente incomplete:** În trecut a avut dosare blocate din cauza documentelor lipsă
- ⭐ **Client fidel:** 5+ dosare finalizate cu succes

### Date KYC/AML (pentru conformitate)
- Ocupație (PF) / Obiect de activitate (PJ)
- Venituri estimate (range sau valoare)
- Sursa fondurilor (pentru tranzacții mari > EUR 10k)
- PEP flag (Politically Exposed Person): Da/Nu
- Note AML (text liber pentru observații conformitate)

---

## Documente KYC Centralizate

### Entitate: ClientDocument

**Tipuri documente:**
- CI (carte identitate / pașaport)
- Certificat fiscal
- Certificat constatator (pentru PJ)
- Extras cont bancar
- Declarație venituri
- Altele

**Metadata:**
- Tip document
- File path (stocare)
- Data upload
- Uploaded by (user)
- Expiry date (pentru CI, certificate cu termen)

### Reutilizare Documente

**Scenario:** Client Ion Popescu are CI uploadat în dosar din 2024, valabil până în 2030.

**Flow:**
1. Asistent creează dosar nou în 2025, adaugă Ion Popescu ca parte
2. Sistem verifică: "Ion Popescu are CI valabil în ClientDocument?" → DA
3. Alertă: "✅ CI disponibil (valabil până 2030), nu e nevoie să cereți din nou"
4. Asistent poate linka documentul existent sau upload nou dacă clientul aduce CI nou

**Verificare expirare automată:**
- Sistem rulează job zilnic: verifică ClientDocuments cu expiry_date < 30 zile
- Alertă pe Dashboard: "⚠️ CI-ul clientului Maria Ionescu expiră în 15 zile"

---

## Istoric Dosare

Fiecare fișă client afișează:
- **Lista dosare** în care clientul a fost parte (orice rol)
- Per dosar:
  - Număr dosar
  - Tip act
  - Rol în dosar (Vânzător, Cumpărător, etc.)
  - Status dosar
  - Data creare / Data finalizare
  - Link rapid către dosar

**Filtre:**
- Toate dosarele / Doar finalizate / Doar active
- Sortare: Data descrescător / crescător

---

## Note Interne

Text liber vizibil doar pentru echipa biroului, NU pentru client.

**Exemple:**
- "Client pretențios, verificați tot de 2 ori"
- "Preferă comunicare pe WhatsApp, nu e-mail"
- "Are întârziere la plăți, solicită plată în avans"

---

## Operațiuni pe Clienți

### Creare Client
- Form rapid: Nume + CNP/CUI (minim) → Salvare → Completare ulterioară detalii
- Form complet: Toate câmpurile + upload CI imediat

### Căutare Client
- **Search bar global:** Input CNP/CUI sau nume → Rezultate instant
- **Search avansat:** Filtre după tip (PF/PJ), categorie, flag-uri, dată creare

### Editare Client
- Orice user cu permisiune poate edita date contact, note
- Editare date critice (CNP, CUI) → Logat în audit trail

### Merge Duplicates
**Scenario:** Există 2 înregistrări pentru "Ion Popescu" (duplicate din greșeală).

**Flow:**
1. Administrator → Clienți → Identifică duplicate
2. Selectează Client A (păstrare) și Client B (ștergere)
3. Sistem:
   - Transferă toate dosarele din Client B → Client A
   - Transferă documente din Client B → Client A
   - Marchează Client B ca "Merged into Client A" (soft delete)
4. Toate referințele viitoare → Client A

### Export Clienți
- Export CSV/Excel: listă clienți cu date de bază
- **GDPR warning:** Export disponibil doar pentru Administrator, necesită justificare (logged)

---

## GDPR: Drepturi Data Subject

### Drept de Acces
Client solicită: "Ce date aveți despre mine?"

**Flow:**
1. Administrator → GDPR → "Cerere acces date"
2. Selectare client (CNP)
3. Sistem generează raport PDF:
   - Date personale stocate
   - Dosare în care apare
   - Documente uploadate
   - Log acces (cine a vizualizat datele)
4. Export PDF → Trimis clientului (max 30 zile conform GDPR)

### Drept de Ștergere
Client solicită: "Ștergeți datele mele"

**Conflict:** Notarul are obligație legală păstrare arhivă 30 ani → **Excepție GDPR art. 17.3.b**

**Flow:**
1. Administrator verifică: "Clientul are dosare finalizate?" 
   - DA → Răspuns refuz: "Datele sunt necesare pentru arhivă notarială legală (30 ani), nu putem șterge conform art. 17.3.b GDPR"
   - NU (sau doar draft-uri anulate) → Ștergere posibilă
2. Date opționale (e-mail marketing, telefon secundar) → Ștergere imediată
3. Log cerere GDPR pentru audit

### Anonimizare (după 30 ani)
- Sistem permite anonimizare: CNP → "ANONYMIZED_123", Nume → "Client Anonim #123"
- Păstrează doar date strict necesare pentru statistici (tip act, valoare, dată)

---

## Verificări Automate

### Validare CNP
- Check digit valid (algoritm oficial)
- Dată naștere logică (nu în viitor, nu înainte de 1900)
- Sex conform CNP

### Validare CUI
- Check digit valid (algoritm ANAF)
- Query API ANAF (dacă disponibil): "CUI existent și activ?"

### Alertă Duplicate
La creare client nou:
- Sistem verifică: "Există deja client cu acest CNP/CUI?"
- Dacă DA → Warning: "⚠️ Client deja existent, doriți să folosiți fișa existentă?"

---

## Segmentare Clienți (Roadmap V2+)

### Filtre Avansate
- Clienți recurenți (3+ dosare ultimul an)
- Clienți inactivi (fără dosare > 2 ani)
- Clienți cu risc AML
- Clienți VIP

### Client Lifetime Value
Calcul automat: Suma totală onorarii generate de client în toate dosarele

**Vizualizare:**
- Top 10 clienți după valoare
- Utilizare pentru prioritizare servicii, discount-uri loialitate

---

**[Next: Document Automation →](./03c-document-automation.md)**
