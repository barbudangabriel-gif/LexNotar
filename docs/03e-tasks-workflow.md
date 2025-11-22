# 3e. Tasks & Workflow Management

[← Înapoi la Overview](./03-functional-modules-overview.md) | [← Previous](./03d-scheduling-calendar.md) | [Next →](./03f-billing-accounting.md)

---

## Obiectiv

Sistem de task-uri pentru coordonarea echipei, tracking progres dosare, deadlines, responsabilități.

---

## Entitate: Task

**Date principale:**
- Titlu (ex: "Verifică CI client Popescu")
- Descriere (detalii)
- Case ID (dosar asociat) - optional
- Asignat către: User ID (notar, asistent, contabil)
- Creat de: User ID
- Prioritate: Normală, Urgentă, Critică
- Status: To Do, In Progress, Blocked, Done, Cancelled
- Deadline: Data + ora
- Tag-uri: Listă (ex: ["KYC", "Documentație", "Verificare ANAF"])
- Checklist: Array de sub-task-uri (titlu + checked/unchecked)
- Attachments: Link-uri către documente (ex: scan CI pentru verificare)
- Created at, Updated at

---

## Creare Task

### Manual

**Asistent:** Dosare → Dosar #123 → Tab "Tasks" → "Creare task nou"

**Form:**
- Titlu: "Solicită extras CF de la client"
- Asignat: @Andreea (dropdown cu toți userii biroului)
- Deadline: 25.11.2025 17:00
- Prioritate: Normală
- Descriere: "Client trebuie să trimită extras CF actualizat pentru imobil strada X"
- Checklist:
  - ☐ Trimite e-mail client cu cererea
  - ☐ Primește extras CF
  - ☐ Verifică validitate (max 30 zile vechime)

**Salvare:** Task creat, notificare trimisă către @Andreea.

---

### Creare Automată

Sistem creează automat task-uri la anumite evenimente:

**Exemplu 1: Dosar nou creat → Status "KYC"**
- Task auto: "Verifică KYC client {NUME}" (asignat: asistent responsabil dosar)
- Checklist:
  - ☐ Verifică CI valid
  - ☐ Verifică CNP
  - ☐ Verifică ANAF (dacă PJ)

**Exemplu 2: Conflict of Interest detectat**
- Task auto: "Rezolvă conflict interese dosar #{NR}" (asignat: notar)
- Prioritate: Critică

**Exemplu 3: Client absent programare**
- Task auto: "Contactează client {NUME} pentru reprogramare" (asignat: asistent)

**Exemplu 4: Dosar fără activitate 7 zile**
- Task auto: "Verifică status dosar #{NR} - Fără activitate 7 zile" (asignat: notar responsabil)

---

## Workflow Status

### To Do
- Default la creare
- Task-ul apare în lista "De făcut" a utilizatorului asignat

### In Progress
- Utilizator: Click pe task → "Start working"
- Sistem marchează task "In Progress" + timestamp

### Blocked
- Utilizator: "Marchează blocat"
- Motiv: Text liber (ex: "Așteptăm document de la client")
- Task rămâne în dashboard cu flag 🚧 "Blocat"

### Done
- Utilizator: "Marchează finalizat"
- Sistem: Task dispare din lista activă, moved to "Completate"
- Dacă task legat de dosar → eveniment în Activity Log dosar

### Cancelled
- Utilizator: "Anulează task"
- Motiv: Text liber (ex: "Dosar anulat de client")

---

## Views & Dashboard

### My Tasks (Personalizat per Utilizator)

**View implicit:**
- 📋 **To Do** (toate task-urile asignate mie, status To Do, sortate după deadline)
- 🏃 **In Progress** (task-uri pe care lucrez acum)
- 🚧 **Blocked** (task-uri blocate asignate mie)

**Filtre:**
- Prioritate: Critică, Urgentă, Normală
- Deadline: Astăzi, Săptămâna asta, Luna asta, Fără deadline
- Dosar: Filter după dosar specific
- Tag-uri: Filter după tag

---

### Kanban Board (View Echipă)

**Coloane:**
- **Backlog** (task-uri viitoare, fără asignat)
- **To Do** (asignate, neîncepute)
- **In Progress**
- **Blocked**
- **Done** (ultimele 7 zile)

**Card task:**
```
┌─────────────────────────────┐
│ Verifică CI client Popescu  │ 🔴 Urgentă
│ @Andreea                    │
│ ⏰ Deadline: 25.11 17:00    │
│ 📁 Dosar #123              │
└─────────────────────────────┘
```

**Drag & Drop:** Utilizator poate trage task-ul între coloane pentru schimbare status.

---

### Calendar View (Tasks + Appointments)

**Integrare cu Calendar:**
- Task-uri cu deadline apar în calendar ca evenimente
- Culoare diferită față de programări (ex: task = albastru, programare = verde)

**Beneficiu:** Notar vede într-o singură privire:
- 10:00 - Programare semnare
- 12:00 - Task: Trimite act la ONRC
- 15:00 - Programare consultație

---

## Notificări Task-uri

### Notificare la Creare

**Destinatar:** Utilizator asignat

**Canal:**
- In-app: Badge roșu pe icon "Tasks" în meniu
- E-mail (dacă activat în preferințe)
- (Roadmap) Push notification în mobile app

**Conținut:**
```
📋 Task nou asignat: "Verifică CI client Popescu"
Creat de: Maria (Notar)
Deadline: 25.11.2025 17:00
Dosar: #123 - Vânzare-cumpărare Popescu/Ionescu

[Vezi task →]
```

---

### Reminder Deadline

**Trigger:** Job automat zilnic 08:00

**Verifică:**
- Task-uri cu deadline în următoarele 24h + status ≠ Done

**Trimite reminder:**
```
⏰ Reminder: Task-ul "Trimite act ONRC" expiră mâine la 17:00
Dosar: #125 - Constituire SRL

[Vezi task →]
```

---

### Notificare Deadline Depășit

**Trigger:** Job automat zilnic 08:00

**Verifică:**
- Task-uri cu deadline în trecut + status ≠ Done

**Trimite alerta:**
```
🔴 URGENT: Task "Verifică extras CF" a depășit deadline-ul (era 23.11.2025)
Dosar: #123
Prioritate: Critică

[Vezi task →]
```

**Escalation (Optional):**
- Dacă task depășește deadline cu 2 zile → notificare și către manager/notar responsabil

---

## Task Templates

### Concept

**Problema:** Multe task-uri repetitive (ex: pentru fiecare dosar vânzare, trebuie verificat CF, CI, act proprietate).

**Soluție:** Template-uri de task-uri per tip act.

---

### Exemplu: Template "Vânzare-Cumpărare Imobil"

**Task-uri auto-generate:**

1. **Verificare documente vânzător**
   - ☐ CI valid
   - ☐ Certificat căsătorie (dacă aplicabil)
   - ☐ Certificat fiscal imobil (max 30 zile)
   - ☐ Act proprietate (verifică în dosar)

2. **Verificare documente cumpărător**
   - ☐ CI valid
   - ☐ Certificat căsătorie (dacă aplicabil)
   - ☐ Confirmare sursă fonduri (KYC/AML)

3. **Verificări externe**
   - ☐ ANAF: Verifică datorii vânzător
   - ☐ Extras CF actualizat (max 10 zile)
   - ☐ Verifică sarcini/ipoteci pe imobil

4. **Întocmire act**
   - ☐ Generare draft act vânzare-cumpărare
   - ☐ Review de către notar
   - ☐ Trimite draft către părți pentru verificare

5. **Semnare & înregistrare**
   - ☐ Programează semnare
   - ☐ Semnare QES
   - ☐ Înregistrare Repertoriu Notarial
   - ☐ Transmitere ANCPI (dacă aplicabil)
   - ☐ Eliberare copie legalizată părți

**Asignare:**
- Task-uri 1-3: Asistent
- Task 4: Notar
- Task 5: Asistent + Notar

---

### Activare Template

**Flow:**
1. Dosar nou creat → Tip act: "Vânzare-cumpărare imobil"
2. Sistem: "Vrei să aplici template task-uri pentru Vânzare-cumpărare?"
3. Asistent: "Da" → 15 task-uri create automat, asignate echipei

---

## Comentarii & Colaborare pe Task

### Thread Comentarii

**Use case:** Task complex necesită discuții între membri echipă.

**Flow:**
1. Andreea (Asistent): Task "Verifică extras CF" → "Adaugă comentariu"
2. Text: "@Maria, extrasul CF arată o ipotecă veche din 2010. E radiată?"
3. Maria (Notar): Primește notificare, răspunde: "Da, e radiată. Am documentul în dosar fizic, îl scanez."
4. Andreea: "Perfect, mulțumesc!"

**Beneficiu:** Istoric conversație legat de task, nu se pierd informații în e-mail-uri.

---

## Recurring Tasks (Roadmap)

### Concept

Task-uri recurente (ex: verificare zilnică registru, raportare lunară).

**Exemplu:**
- **Task:** "Backup local dosare"
- **Recurență:** În fiecare vineri la 18:00
- **Asignat:** Administrator

**Sistem:** Creează automat task-ul în fiecare vineri, marchează done anterior (dacă e cazul).

---

## Integrare cu Dosare

### Activity Log Dosar

**Eveniment task:** Orice acțiune pe task legat de dosar apare în Activity Log.

**Exemplu:**
```
21.11.2025 10:30 - Andreea a marcat task "Verifică CI client" ca Done
20.11.2025 15:00 - Maria a creat task "Trimite act ONRC" (asignat: Andreea)
19.11.2025 09:00 - Task auto-generat "Verifică KYC client Popescu"
```

---

### Progress Bar Dosar

**Concept:** Afișare vizuală % completare task-uri dosar.

**Calcul:**
- Dosar #123 are 10 task-uri
- 7 Done, 2 In Progress, 1 To Do
- Progress: 70%

**Display:** Progress bar pe header dosar:
```
Dosar #123 - Vânzare-cumpărare Popescu/Ionescu
[████████░░] 70% completat (7/10 task-uri)
```

---

## Raportare Tasks

### Dashboard Manager/Notar

**Statistici:**
- **Task-uri per asignat:** Andreea: 5 To Do, 2 In Progress, 20 Done (luna curentă)
- **Task-uri overdue:** 3 task-uri cu deadline depășit
- **Task-uri blocate:** 2 task-uri marcate "Blocked" de mai mult de 3 zile
- **Average completion time:** Task-urile se rezolvă în medie în 2.5 zile

**Alert-uri:**
- 🔴 "Ion (Contabil) are 15 task-uri în To Do - posibil overload"
- 🔴 "Dosar #130 are 5 task-uri overdue"

---

## Task Priority & SLA (Roadmap - Birouri Mari)

### Service Level Agreement

**Exemplu:** Birou mare definește SLA-uri:
- Task **Critică** → trebuie rezolvat în **4 ore**
- Task **Urgentă** → trebuie rezolvat în **24 ore**
- Task **Normală** → trebuie rezolvat în **3 zile**

**Sistem:**
- Monitorizare automată
- Dacă task depășește SLA → Alert automat către manager
- Raportare lunară: "95% task-uri Critice rezolvate în SLA, 88% Urgente în SLA"

---

**[Next: Billing & Accounting →](./03f-billing-accounting.md)**
