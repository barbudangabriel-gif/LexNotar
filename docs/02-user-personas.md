# 2. User Personas & Key Use Cases

[← Înapoi la Cuprins](../PRODUCT_BLUEPRINT.md) | [← Previous](./01-vision-and-positioning.md) | [Next →](./03-functional-modules.md)

---

## 2.1 Persona 1: Notarul

### Profil: Maria, 45 ani, 15 ani experiență

**Context:**
- Responsabil legal final pentru toate actele notariale
- Semnează fizic sau electronic (QES) toate actele
- Trebuie să aibă control complet asupra riscurilor și conformității
- Lucrează cu 2-3 asistenți care pregătesc dosarele
- Dorește să vadă rapid starea tuturor dosarelor fără să se piardă în detalii

**Pain points actuale (fără LexNotar):**
- "Pierd timp verificând manual fiecare dosar dacă sunt toate documentele"
- "Nu știu sigur câte dosare am în lucru și care sunt prioritățile"
- "Trebuie să semnez acte pe hârtie, apoi să le scann pentru arhivă - dublu work"
- "La control UNNPR, mi-a luat 2 zile să pregătesc rapoartele cerute"

**Obiective în LexNotar:**
- Vizibilitate instantanee: "Câte dosare am pentru semnare astăzi?"
- Încredere: "Sunt sigur că toate verificările au fost făcute"
- Eficiență: "Semnez electronic în 2 minute, nu 20 minute cu print-scan-arhivare"
- Protecție: "Dacă un client contestă, am audit trail complet"

---

### Use Cases Critice pentru Notar

#### UC 2.1.1: Review Rapid al Dosarelor Pregătite
**Descriere:** Notarul vede rapid toate dosarele care așteaptă review/aprobare.

**Flow:**
1. Login LexNotar → Dashboard
2. Widget "Dosare pentru review" (lista dosarelor în status "For Review")
3. Click pe dosar → Vizualizare detalii:
   - ✅ Checklist 100% completat
   - ✅ Toate documentele obligatorii încărcate
   - ✅ Părți verificate KYC
   - ⚠️ Warning-uri (dacă există): "Client nou, valoare mare → verificare AML obligatorie"
4. Preview act generat (PDF) în browser
5. Dacă OK → Buton "Aprobă" → Dosar trece în "For Signature"
6. Dacă probleme → Adaugă comentariu → Returnează la asistent pentru corecții

**Success criteria:** Notarul poate review un dosar în < 3 minute (față de 15-20 minute manual).

---

#### UC 2.1.2: Aprobare și Semnare Acte cu QES
**Descriere:** Notarul inițiază proces de semnare electronică calificată direct din LexNotar.

**Flow:**
1. Dosar în status "For Signature"
2. Click "Inițiază semnare QES"
3. Sistem generează PDF final (watermark "MINUT", timestamp)
4. Selectare furnizor QES (ex: Certinomis - preonfigurat de administrator)
5. Confirm → Sistem trimite PDF la furnizor QES prin API
6. Furnizor returnează link semnare sau declanșează workflow
7. Notar + Părți semnează (fiecare cu certificatul calificat propriu)
8. Callback de la furnizor: "Semnat complet"
9. LexNotar salvează PDF semnat, marchează dosar "Signed", înregistrare automată în Repertoriu
10. Notificare către asistent: "Dosarul X semnat, pregătește factura"

**Success criteria:** Semnare completă în < 5 minute (față de 30+ minute cu printare-semnare fizică-scanare).

---

#### UC 2.1.3: Identificare și Management Risc
**Descriere:** Notarul vede instant dosarele cu risc și ia decizii informate.

**Flow:**
1. Dashboard → Widget "Alerte & Risc"
2. Lista dosare cu flaguri:
   - 🔴 **Risc AML:** "Dosar #123 - Client nou, tranzacție EUR 100,000, sursa fonduri neclarificată"
   - 🟡 **Document lipsă:** "Dosar #456 - CI cumpărător expiră în 10 zile"
   - 🟡 **Termen depășit:** "Dosar #789 - Programare era acum 2 zile, dosar încă în Draft"
   - 🔵 **Info:** "Dosar #234 - Client recurent (10 dosare anterioare), risc scăzut"
3. Click pe alertă → Dosar complet cu detalii
4. Acțiuni posibile:
   - Adaugă task: "Solicită dovadă sursa fonduri de la client"
   - Blochează dosar: "NU continua până la clarificare AML"
   - Marchează rezolvat: "Client a furnizat documente, risc redus"

**Success criteria:** Notarul identifică și gestionează riscurile proactiv, nu reactiv după probleme.

---

#### UC 2.1.4: Rapoarte și Overview General
**Descriere:** Notarul vede performanța biroului și a echipei.

**Flow:**
1. Menu → Rapoarte
2. Dashboard rapoarte:
   - **Dosare active per status:** 
     - Draft: 12
     - În lucru: 25
     - Pentru review: 8
     - Pentru semnare: 5
     - Semnate luna asta: 47
   - **Venituri:** 
     - Luna curentă: 35,000 RON (vs. 32,000 luna trecută, +9%)
     - Top 3 tipuri acte: Vânzare-Cumpărare (60%), Ipotecă (20%), Procură (10%)
   - **Performanță echipă:**
     - Asistent Andreea: 22 dosare finalizate luna asta, avg 4 zile/dosar
     - Asistent Ion: 18 dosare finalizate, avg 5.5 zile/dosar
3. Export raport PDF pentru prezentare sau arhivă

**Success criteria:** Notarul ia decizii bazate pe date, nu pe intuiție.

---

#### UC 2.1.5: Audit Trail pentru Protecție Proprie
**Descriere:** Notarul verifică cine a făcut ce și când pe un dosar contestat.

**Scenario:** Un client contestă un act de vânzare, susține că nu a semnat sau că datele sunt greșite.

**Flow:**
1. Căutare dosar contestat (ex: Dosar #123/2024)
2. Tab "Audit Trail"
3. Vizualizare cronologică:
   - `2024-03-15 10:23` - Dosar creat de Asistent Andreea
   - `2024-03-15 14:45` - Adăugată parte "Ion Popescu - Vânzător" (CNP 1790101123456)
   - `2024-03-16 09:12` - Upload document "CI Ion Popescu.pdf" de Asistent Andreea
   - `2024-03-18 11:30` - Act generat din template "Vanzare-Cumparare-v2.docx"
   - `2024-03-20 16:45` - Dosar aprobat de Notar Maria
   - `2024-03-21 10:00` - **Semnare QES inițiată** de Notar Maria
   - `2024-03-21 10:15` - **Semnat de Ion Popescu** (certificat serial: ABC123..., IP: 192.168.1.50)
   - `2024-03-21 10:18` - **Semnat de Maria Ionescu** (certificat serial: DEF456...)
   - `2024-03-21 10:20` - Dosar marcat "Signed", înregistrat în Repertoriu #123/2024
4. Export audit trail PDF pentru avocat/instanță

**Success criteria:** Notarul demonstrează că procesul a fost corect, cu dovezi timestamp și semnături certificate.

---

#### UC 2.1.6: Gestionare Calendar și Programări
**Descriere:** Notarul vede toate întâlnirile zilei și evită suprapuneri.

**Flow:**
1. Dashboard → Widget "Calendar astăzi"
2. Lista programări:
   - 09:00 - 10:00: Dosar #456 - Semnare Donație (Sala 1)
   - 11:00 - 12:00: Dosar #789 - Consultație Succesiune (Sala 1)
   - 14:00 - 15:00: Dosar #234 - Semnare Procură (Sala 2)
3. Click pe programare → Detalii dosar, părți implicate
4. Dacă client nu vine → Marchează "Client absent" → Sistem creează task automat: "Reprogramează dosar #456"
5. Adaugă programare nouă:
   - Selectare slot liber (sistem arată doar slot-uri fără conflict)
   - Selectare dosar existent sau creare dosar nou
   - Confirm → Reminder automat trimis clientului (e-mail/SMS)

**Success criteria:** Zero double-booking, notarul știe exact ce îl așteaptă în fiecare zi.

---

#### UC 2.1.7: Acces Mobil pentru Urgențe
**Descriere:** Notarul consultă dosare și aprobă urgent din telefon când e în deplasare.

**Flow (Mobile-responsive Web sau App):**
1. Notificație push: "Dosar #999 - Urgent, client așteaptă aprobare pentru semnare azi"
2. Open LexNotar pe telefon
3. Login (2FA dacă activat)
4. Dosar #999 → Review rapid:
   - Scroll checklist (toate ✅)
   - Preview act (zoom în PDF pe telefon)
5. Buton mare "Aprobă" → Confirm
6. Dosar trece în "For Signature", asistent notificat

**Success criteria:** Notarul nu e blocat de lipsa acces desktop, poate lucra de oriunde.

---

## 2.2 Persona 2: Asistenta/Secretara

### Profil: Andreea, 28 ani, 3 ani experiență

**Context:**
- Primul contact cu clientul (telefon, e-mail, walk-in)
- Pregătește dosarul de la zero până la stadiul "gata pentru semnare"
- Gestionează documentele, checklist-urile, programările, comunicarea cu clienții
- Lucrează simultan pe 10-20 dosare în diferite stadii
- Responsabilă de detalii: "Dacă lipsește un document, notarul va refuza dosarul"

**Pain points actuale:**
- "Uit ce documente am cerut de la fiecare client, trebuie să caut în e-mail-uri"
- "Fac acte manual în Word, copiez-lipesc date - risc de greșeli"
- "Notarul mă întreabă 'Cum stă dosarul X?' și trebuie să verific în 5 locuri"
- "La sfârșitul zilei am 20 de tab-uri deschise în browser și nu mai știu la ce lucram"

**Obiective în LexNotar:**
- Organizare: "Toate dosarele mele într-o singură listă, filter quick după status"
- Automatizare: "Generez actul cu click, nu mai copiez date manual"
- Trasabilitate: "Știu exact ce am cerut de la client și ce am primit"
- Colaborare: "Notarul vede instant când am terminat pregătirea"

---

### Use Cases Critice pentru Asistent

#### UC 2.2.1: Intake Client și Creare Dosar Nou
**Descriere:** Clientul sună sau vine la birou, asistenta creează dosar rapid.

**Flow:**
1. Client: "Vreau să fac o vânzare-cumpărare pentru apartamentul meu"
2. Asistent deschide LexNotar → Buton "Dosar Nou"
3. Form wizard:
   - **Pas 1: Tip act** - Selectare "Vânzare-Cumpărare Imobil"
   - **Pas 2: Părți** 
     - Vânzător: Căutare în CRM "Ion Popescu" → Găsit (client recurent) → Selectare
     - Cumpărător: Client nou → Form rapid (nume, CNP, telefon, e-mail) → Salvare
   - **Pas 3: Obiect**
     - Imobil: Adresă, nr. cadastral (dacă știe clientul), suprafață, valoare declarată
   - **Pas 4: Detalii dosar**
     - Data dorită semnare, Note interne
4. Sistem automat:
   - Generează număr dosar (ex: 123/2025)
   - Aplică checklist template pentru "Vânzare-Cumpărare Imobil" (10 items)
   - Atribuie dosar către asistent Andreea + Notar Maria (dacă configurare automată)
   - Creează task: "Solicită certificate fiscale de la ambele părți"
5. Salvare → Dosar creat în status "Draft"
6. Sistem sugerează: "Vrei să trimiți e-mail către client cu lista documente necesare?" → Yes → E-mail template pre-populat → Send

**Success criteria:** Creare dosar complet în < 2 minute (față de 10+ minute manual în Excel/Word).

---

#### UC 2.2.2: Completare Checklist Documente
**Descriere:** Asistenta primește documente de la client, le uploadează și marchează checklist.

**Flow:**
1. Lista "Dosarele mele" → Dosar #123 (Draft)
2. Tab "Checklist" → Vezi 10 items, 3 marcate ✅, 7 în așteptare ❌
3. Client trimite pe e-mail scan CI vânzător
4. Download din e-mail → Upload în LexNotar:
   - Drag & drop "CI_Ion_Popescu.pdf" în zona upload
   - Sistem detectează automat: "Acest document corespunde item-ului 'CI vânzător'?" → Confirm
   - Item "CI vânzător" marcat automat ✅, document anexat
5. Repetă pentru fiecare document primit
6. Când toate items sunt ✅:
   - Sistem sugerează: "Checklist complet! Vrei să generezi actul acum?" → Yes
   - Tranziție automată dosar în "În lucru"

**Success criteria:** Gestionare documente organizată, zero risc de pierdere/uitare.

---

#### UC 2.2.3: Pregătire și Populare Template Act
**Descriere:** Asistenta generează actul notarial din template cu date automate.

**Flow:**
1. Dosar #123 → Tab "Documente" → Buton "Generează Act"
2. Sistem afișează: "Template pentru Vânzare-Cumpărare Imobil (versiune 2024.3)" (administrator a configurat template default pentru acest tip act)
3. Preview variabile:
   - `{NUME_VANZATOR}` → "Ion Popescu" (din partea Vânzător)
   - `{CNP_VANZATOR}` → "1790101123456"
   - `{NUME_CUMPARATOR}` → "Maria Ionescu"
   - `{ADRESA_IMOBIL}` → "Bd. Magheru nr. 10, București"
   - `{PRET}` → "150000" (cifre)
   - `{PRET_LITERE}` → "o sută cincizeci de mii" (conversie automată)
4. Asistent verifică variabilele (poate edita manual dacă e nevoie)
5. Buton "Generează" → Sistem:
   - Ia template DOCX
   - Replace toate variabilele cu valorile reale
   - Generează DOCX + PDF preview
6. Download DOCX (dacă notar vrea ajustări manuale) sau direct PDF pentru review
7. Upload PDF final în dosar → Marchează "Act generat, gata pentru review"
8. Tranziție dosar în "For Review" → Notar notificat

**Success criteria:** Generare act în < 1 minut, zero erori de copy-paste.

---

#### UC 2.2.4: Programare Întâlniri
**Descriere:** Asistenta programează semnarea actului cu clientul.

**Flow:**
1. Dosar #123 aprobat de notar → Status "For Signature"
2. Asistent → Tab "Programări" → Buton "Programează Semnare"
3. Calendar view (săptămâna următoare):
   - Sistem arată slot-uri disponibile pentru Notar Maria + Sala 1
   - Slot-uri ocupate sunt gri (evitare conflict)
4. Selectare: Luni 15:00 - 16:00
5. Form:
   - Participanți: Notar Maria, Ion Popescu (vânzător), Maria Ionescu (cumpărător), Asistent Andreea
   - Sala: Sala 1 (auto-selectat)
   - Note: "Aduceți buletin original"
6. Salvare → Programare creată
7. Sistem automat:
   - Reminder e-mail către părți (24h înainte): "Vă așteptăm luni la ora 15:00 pentru semnarea actului de vânzare-cumpărare. Aduceți buletin original."
   - (Optional) SMS reminder
8. Programarea apare în calendar-ul notarului și asistentei

**Success criteria:** Programare în < 1 minut, reminders automate (fără risc de uitare).

---

#### UC 2.2.5: Comunicare și Task-uri
**Descriere:** Asistenta gestionează task-uri și colaborează cu echipa.

**Flow:**
1. Dosar #456 - Asistent observă: "Lipsește certificat fiscal imobil"
2. Buton "Creare Task" pe dosar:
   - Titlu: "Solicită certificat fiscal de la primărie"
   - Asignat: Andreea (self)
   - Due date: Peste 3 zile
   - Prioritate: High
   - Descriere: "Client a promis că merge mâine la primărie, follow-up joi"
3. Task apare în lista personală "My Tasks"
4. A doua zi: Client sună "Am certificatul" → Asistent:
   - Marchează task "Done"
   - Upload certificat în dosar
   - Checklist item "Certificat fiscal" ✅
5. **Colaborare cross-team:**
   - Asistent creează task: "Verifică suma corectă taxă notarială pentru acest dosar" → Asignat: Contabil Ion
   - Contabil primește notificare, verifică, comentează pe task: "Taxa corectă: 1500 RON"
   - Asistent vede comentariul, actualizează factura

**Success criteria:** Task-uri clare, nimic nu "cade printre scânduri", colaborare fluidă.

---

#### UC 2.2.6: Gestionare Modificări Last-Minute
**Descriere:** Clientul schimbă ceva înainte de semnare, asistenta regenerează actul rapid.

**Scenario:** Cu o zi înainte de semnare, cumpărătorul sună: "Am negociat preț mai mic, 145,000 EUR în loc de 150,000"

**Flow:**
1. Asistent → Dosar #123 (For Signature)
2. Edit detalii obiect: Valoare imobil: ~~150000~~ → 145000
3. Tab "Documente" → Act generat versiunea 1 (PDF cu 150,000)
4. Buton "Regenerează Act" → Sistem:
   - Creează versiunea 2 (PDF cu 145,000)
   - Păstrează versiunea 1 în istoric (cu label "Superseded")
5. Notificare către notar: "Dosar #123 - act regenerat (schimbare preț), verificare necesară"
6. Notar vede diff între V1 și V2 (highlight: preț modificat)
7. Notar aprobă V2 → Programare rămâne validă, la întâlnire se semnează V2

**Success criteria:** Modificări gestionate în < 5 minute, trasabilitate completă (versiuni păstrate).

---

#### UC 2.2.7: Tranziție Status Dosar (Finalizare)
**Descriere:** După semnare, asistenta finalizează dosarul și declanșează facturare.

**Flow:**
1. Luni 15:30 - Semnare finalizată (notar + părți au semnat electronic sau fizic)
2. Notar marchează în sistem: "Semnat" → Status dosar trece automat în "Signed"
3. Sistem automat:
   - **Înregistrare în Repertoriu:** Dosar #123 → Repertoriu nr. 123/2025, data/ora curentă
   - **Creare task pentru contabil:** "Generează factură pentru dosar #123"
4. Asistent (sau contabil):
   - Generează factură (sistem calculează automat onorariu conform grilei + taxe)
   - Emite factură → Status "Neplătită"
5. Client plătește → Marchează factură "Plătită"
6. Asistent:
   - Arhivează dosar: Status "Archived"
   - (Optional) Trimite e-mail către client: "Actul semnat + factura sunt disponibile pentru descărcare din portalul client"

**Success criteria:** Workflow complet automatizat, de la semnare la arhivare în < 10 minute.

---

## 2.3 Persona 3: Contabilul

### Profil: Ion, 52 ani, expert financiar

**Context:**
- Gestionează facturarea, verifică plățile, extrage rapoarte pentru contabilitate externă
- Urmărește onorarii și taxe, reconciliază încasările
- NU lucrează direct pe dosare (nu pregătește acte), dar are nevoie de date corecte și la timp
- Interfață cu soft-ul de contabilitate extern (Saga, Keez, etc.)

**Pain points actuale:**
- "Primesc date de facturare de la notari/asistenți pe WhatsApp sau Excel - haos"
- "Nu știu ce facturi sunt plătite și care nu, trebuie să verific cont bancar manual"
- "La sfârșitul lunii, mi-a luat 2 zile să reconciliez toate facturile cu plățile"

**Obiective în LexNotar:**
- Transparență: "Vezi toate facturile într-o listă centralizată, cu status clar"
- Automatizare: "Calcul onorariu conform grilei, nu mai fac calcule manuale"
- Reconciliere ușoară: "Marchează facturile plătite cu 2 click-uri"
- Export: "Export pentru contabilitate externă în 1 minut"

---

### Use Cases Critice pentru Contabil

#### UC 2.3.1: Generare Factură pe Dosar Finalizat
**Descriere:** La finalizare dosar, contabilul generează factură automată.

**Flow:**
1. Task în lista contabilului: "Generează factură pentru dosar #123"
2. Click task → Deschide dosar #123 (status "Signed")
3. Tab "Facturare" → Buton "Generează Factură"
4. Sistem pre-completează:
   - **Client facturat:** Maria Ionescu (cumpărător - configurabil cine plătește)
   - **Onorariu:** 1,350 RON (calculat automat conform grilei pentru 145,000 RON tranzacție)
   - **Taxe:** 
     - Taxă timbru: 100 RON
     - Taxă registru: 50 RON
   - **Total:** 1,500 RON
5. Contabil verifică sumele (poate edita manual dacă e caz special)
6. Confirmă → Factură emisă:
   - Serie/Număr: FAC-2025-0123 (auto-increment)
   - Data emitere: Azi
   - Scadență: +14 zile
   - Status: "Neplătită"
7. PDF factură generat automat → Anexat la dosar
8. (Optional) E-mail automat către client cu factura

**Success criteria:** Generare factură în < 1 minut, calcul corect automat.

---

#### UC 2.3.2: Tracking Status Plăți
**Descriere:** Contabilul vede toate facturile și status-ul lor.

**Flow:**
1. Menu → Facturare → "Toate Facturile"
2. Lista facturilor cu filtre:
   - **Status:** Toate / Neplătite / Plătite / Întârziere
   - **Perioadă:** Luna curentă / Trimestru / An
   - **Client:** Toate / Search client specific
3. View tabelar:
   | Factură | Client | Data | Suma | Status | Acțiuni |
   |---------|--------|------|------|--------|---------|
   | FAC-2025-0123 | Maria Ionescu | 21-Nov | 1,500 RON | 🟢 Plătită | [Detalii] |
   | FAC-2025-0124 | Ion Popescu | 22-Nov | 2,300 RON | 🔴 Neplătită | [Marchează plătită] |
   | FAC-2025-0122 | SC ACME SRL | 19-Nov | 4,500 RON | 🟡 Întârziere (scadență 03-Dec) | [Reminder] |
4. Click "Marchează plătită" pe FAC-2025-0124:
   - Form: Data plată, Metodă plată (Cash/Card/Transfer), Notă
   - Salvare → Status trece în "Plătită"
5. Reminder: Click "Reminder" → E-mail automat către client: "Factura X este restantă, vă rugăm să achitați"

**Success criteria:** Vizibilitate instantanee pe toate facturile, management plăți ușor.

---

#### UC 2.3.3: Reconciliere Încasări
**Descriere:** Contabilul reconciliază plățile primite cu facturile emise.

**Flow:**
1. La sfârșitul zilei/săptămânii, contabilul verifică cont bancar → Văzut transfer: 1,500 RON de la Maria Ionescu
2. LexNotar → Căutare factură: "Maria Ionescu" → Găsit FAC-2025-0123 (Neplătită, 1,500 RON)
3. Click "Marchează plătită":
   - Data plată: Azi
   - Metodă: Transfer bancar
   - Transaction ID: REF123456 (din extras bancar)
4. Salvare → Status "Plătită"
5. (Advanced - V2+) Upload extras bancar CSV → Sistem face matching automat factură-plată pe bază de sumă + nume client

**Success criteria:** Reconciliere în < 5 minute (față de ore manual în Excel).

---

#### UC 2.3.4: Rapoarte Financiare
**Descriere:** Contabilul generează rapoarte pentru contabilitate externă sau management.

**Flow:**
1. Menu → Rapoarte → "Raport Financiar"
2. Selectare parametri:
   - Perioadă: Noiembrie 2025
   - Tipuri: Venituri, Facturi, Plăți
3. Generare raport → Vizualizare:
   - **Venituri totale luna:** 48,500 RON
     - Onorarii: 41,000 RON
     - Taxe colectate pentru stat: 7,500 RON
   - **Breakdown pe tip act:**
     - Vânzare-Cumpărare: 30,000 RON (62%)
     - Ipotecă: 10,000 RON (21%)
     - Procură: 5,000 RON (10%)
     - Altele: 3,500 RON (7%)
   - **Breakdown pe formă de plată:**
     - Transfer bancar: 35,000 RON
     - Card: 10,000 RON
     - Cash: 3,500 RON
   - **Facturi neplătite:** 8,200 RON (5 facturi)
4. Export:
   - PDF (pentru prezentare management)
   - CSV (pentru import în soft contabilitate)
   - XML (dacă format specific ANAF/contabilitate)

**Success criteria:** Raport complet în < 2 minute, export in multiple formate.

---

#### UC 2.3.5: Configurare Grile Onorarii
**Descriere:** Contabilul actualizează grilele de onorarii când legislația se schimbă.

**Flow:**
1. Ordonanță nouă UNNPR: "Onorarii notariale actualizate de la 01 Ianuarie 2026"
2. Contabil → Menu → Setări → "Grile Onorarii"
3. Lista tipuri acte cu grile configurate
4. Edit "Vânzare-Cumpărare Imobil":
   - Calcul: Pe praguri progresive
   - Praguri:
     - 0 - 50,000 RON: 1.0% (min 500 RON)
     - 50,001 - 100,000 RON: 0.8%
     - 100,001 - 200,000 RON: 0.6%
     - 200,001+: 0.4% (max 10,000 RON)
   - Salvare versiune nouă (păstrează istoricul versiunilor pentru dosare vechi)
5. Sistem aplică noua grilă automat la toate dosarele create după 01 Ianuarie 2026

**Success criteria:** Actualizare grilă în < 10 minute, aplicare automată fără erori.

---

#### UC 2.3.6: Export pentru Contabilitate Externă
**Descriere:** Contabilul exportă date pentru soft-ul de contabilitate (Saga, Keez, etc.).

**Flow:**
1. La sfârșitul lunii → Menu → Export → "Export Contabilitate"
2. Selectare:
   - Format: CSV / XML (Saga format) / JSON
   - Perioadă: Luna Noiembrie 2025
   - Date: Facturi emise, Încasări, Cheltuieli (dacă sunt în sistem)
3. Export → Download fișier
4. Import în Saga/Keez → Reconciliere automată

**Success criteria:** Export în < 1 minut, format compatibil direct cu soft-urile populare.

---

## 2.4 Persona 4: Administratorul de Birou

### Profil: Alexandru, 38 ani, tech-savvy, responsabil operațional

**Context:**
- Gestionează utilizatorii, setările sistemului, integrările, backup-urile
- NU lucrează pe dosare, dar asigură ca sistemul să funcționeze optim și securizat
- Responsabil pentru conformitate GDPR, integrări cu sisteme externe
- First point of contact pentru probleme tehnice

**Pain points actuale:**
- "Fiecare notar vrea template-uri diferite, devin haos"
- "Nu știu cine are acces la ce, riscăm breșe de securitate"
- "Când vine control UNNPR, trebuie să scot date manual din 10 locuri"

**Obiective în LexNotar:**
- Control: "Gestionez toate setările centralizat, nu mai cer la fiecare user ce vrea"
- Securitate: "Știu exact cine are acces la ce, pot revoca instant"
- Conformitate: "Sistemul îmi dă rapoarte GDPR/audit gata făcute"
- Automatizare: "Configurez o dată workflow-uri, apoi merg singure"

---

### Use Cases Critice pentru Administrator

#### UC 2.4.1: User Management și RBAC
**Descriere:** Administrator adaugă useri noi și configurează permisiuni.

**Flow:**
1. Notar nou angajat: Maria Ionescu
2. Admin → Menu → Utilizatori → "Adaugă Utilizator"
3. Form:
   - Nume: Maria Ionescu
   - E-mail: maria.ionescu@notariat.ro
   - Telefon: +40 722 123 456
   - **Rol:** Notar (selectare din dropdown)
   - **Office:** Biroul București (dacă multi-office)
   - **Permisiuni custom (optional):** Păstrează default Notar, sau ajustează (ex: "Poate șterge dosare: NU")
4. Salvare → Sistem generează parolă temporară, trimite e-mail: "Bun venit! Schimbă parola la primul login"
5. Maria se loghează → Forced password change → Acces la sistem conform rol Notar

**Success criteria:** Onboarding user nou în < 5 minute, permisiuni corecte din prima zi.

---

#### UC 2.4.2: Configurare Sistem și Template-uri
**Descriere:** Administrator creează/editează template-uri de acte și checklist-uri.

**Flow (Template Act):**
1. Admin → Menu → Template-uri → "Creare Template Nou"
2. Form:
   - Nume: "Vânzare-Cumpărare Imobil v2025"
   - Tip act: Vânzare-Cumpărare Imobil
   - Upload fișier: VanzareCumparare_template.docx (Word cu variabile `{NUME_CUMPARATOR}`, etc.)
3. Sistem parsează template → Detectează variabile automat → Afișează listă:
   - `{NUME_VANZATOR}`, `{CNP_VANZATOR}`, `{NUME_CUMPARATOR}`, `{CNP_CUMPARATOR}`, `{ADRESA_IMOBIL}`, `{PRET}`, `{PRET_LITERE}`, `{DATA_SEMNARE}`
4. Admin confirmă variabile (sau adaugă manual dacă ceva nu e detectat)
5. Salvare → Template disponibil pentru asistenți la generare acte

**Flow (Checklist Template):**
1. Admin → Menu → Checklist-uri → "Creare Checklist"
2. Form:
   - Nume: "Checklist Vânzare-Cumpărare 2025"
   - Tip act: Vânzare-Cumpărare Imobil
   - Items (listă):
     1. CI vânzător (obligatoriu)
     2. CI cumpărător (obligatoriu)
     3. Certificat fiscal imobil (obligatoriu, max 30 zile)
     4. Extras carte funciară (obligatoriu, max 30 zile)
     5. Dovadă proprietate anterioară (obligatoriu)
     6. Acord soț/soție dacă bun comun (condiționat)
     7. Verificare ipoteci active (obligatoriu)
3. Salvare → Checklist aplicat automat la toate dosarele noi tip "Vânzare-Cumpărare"

**Success criteria:** Template/checklist creat în < 10 minute, aplicare automată.

---

#### UC 2.4.3: Integrări Externe
**Descriere:** Administrator configurează API key-uri pentru servicii externe.

**Flow (Integrare QES):**
1. Birou face contract cu Certinomis pentru semnătură electronică
2. Admin primește API key + endpoint URL
3. Admin → Menu → Integrări → "Adaugă Integrare"
4. Form:
   - Tip: QES Provider
   - Nume: Certinomis
   - API Key: [input securizat, masked]
   - Endpoint: https://api.certinomis.ro/v1/
   - Config JSON (optional): { "callback_url": "https://lexnotar.ro/api/webhooks/certinomis" }
5. Salvare → Sistem testează conexiune (API health check) → Success
6. Marchează ca "Provider Default" → Toate cererile de semnare vor folosi Certinomis

**Success criteria:** Integrare configurată în < 5 minute, funcțională instant.

---

#### UC 2.4.4: Audit și Conformitate GDPR
**Descriere:** Administrator răspunde la cereri GDPR și exportă audit logs.

**Scenario:** Client trimite e-mail: "Conform GDPR, vreau să știu ce date aveți despre mine și cine le-a accesat"

**Flow:**
1. Admin → Menu → GDPR → "Cereri GDPR" → "Creare Cerere"
2. Form:
   - Client: Căutare "Ion Popescu" (CNP)
   - Tip cerere: Drept de Acces
3. Sistem generează automat raport:
   - **Date personale stocate:**
     - Nume: Ion Popescu
     - CNP: 1790101123456
     - Adresă: Str. X nr. 10, București
     - Telefon: +40 722 111 222
     - E-mail: ion.popescu@email.ro
   - **Dosare în care apare:** Dosar #123/2024 (Vânzător), Dosar #456/2023 (Cumpărător)
   - **Documente:** CI_Ion_Popescu.pdf (uploaded 2024-03-15)
   - **Acces log:**
     - 2024-03-15 10:23 - Asistent Andreea - Creat client
     - 2024-03-16 09:12 - Asistent Andreea - Upload CI
     - 2024-03-20 16:45 - Notar Maria - View client în dosar
     - 2024-03-21 10:15 - System - Semnare QES
4. Export raport PDF → Trimis clientului în max 30 zile (conform GDPR)

**Success criteria:** Răspuns la cerere GDPR în < 10 minute, raport complet automat.

---

#### UC 2.4.5: Monitoring și Rapoarte Tehnice
**Descriere:** Administrator monitorizează health sistem și detectează probleme.

**Flow:**
1. Admin → Dashboard Admin → Secțiune "System Health"
2. Indicators:
   - **Uptime:** 99.8% (luna curentă)
   - **API Response Time:** Avg 280ms (P95: 450ms) ✅
   - **Storage folosit:** 45GB / 100GB (45%) ✅
   - **Backup status:** Last backup: 03:00 azi, Success ✅
   - **Integrări externe:**
     - Certinomis QES: ✅ OK (last check 5 min ago)
     - SMTP e-mail: ✅ OK
     - SMS gateway: ⚠️ Warning (1 failed SMS în ultimele 24h)
3. Click pe Warning → Detalii eroare: "SMS către +40 722 999 999 failed - număr invalid"
4. Acțiune: Notificare asistent să verifice numărul clientului

**Alerting:**
- Dacă Backup failed → E-mail instant către admin: "⚠️ Backup-ul de azi a eșuat, verifică urgent"
- Dacă Storage > 80% → Alert: "Storage aproape plin, consideră upgrade"

**Success criteria:** Probleme detectate proactiv, nu reactiv după plângeri useri.

---

#### UC 2.4.6: Suport Intern și Training
**Descriere:** Administrator ajută echipa cu probleme tehnice și onboarding.

**Flow:**
1. Asistent nou: "Nu știu cum să generez un act"
2. Admin → Knowledge Base (intern în LexNotar sau wiki extern)
3. Tutoriale video (embedding YouTube sau video local):
   - "Cum creez un dosar nou" (2 min)
   - "Cum generez un act din template" (3 min)
   - "Cum programez o întâlnire" (2 min)
4. Admin poate trimite link direct către tutorial
5. (Advanced - V2+) In-app tooltips interactivi: "Fa click aici pentru a genera actul" → Ghidaj pas cu pas

**Success criteria:** Onboarding useri noi în < 1 săptămână, autonom după training.

---

#### UC 2.4.7: Multi-Office Management (Birouri Mari)
**Descriere:** Administrator gestionează mai multe locații cu setări separate sau partajate.

**Scenario:** Firmă notarială cu 2 sedii: București și Cluj

**Flow:**
1. Admin → Menu → Offices → View:
   - **Office București:** 3 notari, 5 asistenți, 1500 dosare/an
   - **Office Cluj:** 2 notari, 3 asistenți, 800 dosare/an
2. Configurare politici:
   - **Option A (Strict Separation):** Userii din București văd DOAR dosarele București, userii Cluj văd DOAR dosare Cluj
   - **Option B (Shared Access):** Toți userii văd toate dosarele (backup între office-uri)
3. Admin alege Option A → Salvare
4. Userii se loghează → Văd doar dosarele din office-ul lor
5. **Raportare consolidată:** Admin vede raport global (ambele office-uri) + rapoarte separate per office

**Success criteria:** Separare clară între office-uri, dar control centralizat pentru management.

---

**[Next: Functional Modules – Full Feature Map →](./03-functional-modules.md)**
