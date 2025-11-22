# 3d. Scheduling & Calendar

[← Înapoi la Overview](./03-functional-modules-overview.md) | [← Previous](./03c-document-automation.md) | [Next →](./03e-tasks-workflow.md)

---

## Obiectiv

Gestionarea programărilor cu clienții, evitarea suprapunerilor, reminder-e automate.

---

## Entitate: Appointment

**Date principale:**
- Case ID (dosar asociat)
- Tip întâlnire: Semnare act, Consultație, Verificare documente, Altele
- Data și ora start
- Data și ora end (durata)
- Notar responsabil (user_id)
- Sală/Resursă (dacă biroul are mai multe săli)
- Participanți: Listă clienți (din părțile dosarului) + optional asistenți
- Status: Confirmată, Neconfirmată, Anulată, Reprogramată, Finalizată
- Note (ex: "Client solicită întâlnire dimineața")
- Reminder trimis: Da/Nu, Timestamp

---

## Calendar Views

### View Zi
- Timeline 08:00 - 20:00
- Programări afișate ca blocuri color-coded
- Color coding:
  - 🟢 Confirmat
  - 🟡 Neconfirmat
  - 🔴 Conflict/Overlap (dacă există)

### View Săptămână
- Grid 7 zile × ore
- Programări ca blocuri pe grid
- Scroll orizontal pentru navegare

### View Lună
- Calendar classic
- Puncte/badge-uri pe zilele cu programări
- Click zi → Expand listă programări ziua respectivă

---

## Multi-User & Multi-Resource

### Resurse

**Notari:**
- Fiecare notar are calendar propriu
- Filter: "Arată doar calendar Notar Maria" sau "Arată toți notarii"

**Săli (Entitate: RoomResource):**
- Sala 1, Sala 2, etc.
- Capacitate (nr. persoane)
- Office ID (dacă multi-office)

### View Consolidat

Administrator vede:
- Toți notarii + toate sălile într-o singură grilă
- Util pentru management și alocare resurse

---

## Creare Programare

### Flow Manual

1. **Asistent:** Calendar → Click pe slot liber (ex: Luni 15:00)
2. **Form programare:**
   - Dosar: Select din dropdown (doar dosare active) sau "Fără dosar" (consultație pre-dosar)
   - Notar: Select (default: notarul asignat dosarului)
   - Sală: Select (sistem arată doar săli disponibile la ora respectivă)
   - Durată: 30 min / 1h / 2h / Custom
   - Participanți: Auto-populate din părțile dosarului, editabil
   - Tip: Semnare / Consultație / Verificare documente
   - Note
3. **Validare sistem:**
   - ✅ Notar disponibil? (nu are altă programare în același interval)
   - ✅ Sală disponibilă?
   - ❌ Dacă conflict → Warning: "Notarul Maria are deja programare la 15:00"
4. **Salvare:** Programare creată, status "Neconfirmată"

### Programare Automată din Dosar

1. Dosar trece în status "Pentru semnare"
2. Sistem sugerează: "Programează semnare pentru acest dosar?"
3. Click → Form pre-populat cu datele dosarului
4. Selectare dată/oră → Salvare

---

## Evitare Conflicte (Conflict Detection)

### Reguli

**Notar:**
- Un notar NU poate avea 2 programări în același interval (hard block)
- Warning dacă programări consecutive fără pauză: "Notar are 3 programări consecutive 09:00-15:00, fără pauză"

**Sală:**
- O sală NU poate fi alocată pentru 2 programări simultane (hard block)

**Sugestie slot-uri libere:**
- Sistem analizează calendar notarului + săli
- Afișează: "Slot-uri disponibile: Luni 10:00, 14:00, 16:00; Marți 09:00, 11:00"

---

## Reminders Automate

### Trigger

**Reminder cu 24h înainte:**
- Job automat rulează zilnic la 08:00
- Găsește toate programările de mâine (status "Confirmată")
- Trimite reminder către participanți

### Conținut E-mail

```
Subiect: Reminder: Programare la Notariat LexNotar

Bună ziua {NUME_CLIENT},

Vă reamintim că aveți programare la notariatul nostru mâine, {DATA} la ora {ORA}.

Dosar: {TIP_ACT} #{NR_DOSAR}
Notar: {NUME_NOTAR}
Adresă: {ADRESA_NOTARIAT}

Vă rugăm să aduceți:
- Buletin/CI original
- {LISTA_DOCUMENTE_NECESARE}

Pentru reprogramare sau întrebări: {TELEFON_NOTARIAT}

Cu stimă,
Echipa {NUME_NOTARIAT}
```

### SMS Reminder (Optional)

```
Reminder: Programare notariat maine {DATA} ora {ORA}. Adresa: {ADRESA}. Info: {TELEFON}
```

**Cost:** SMS-urile costă (ex: 0.05 RON/SMS), configurabil on/off per birou.

---

## Status Programare

### Workflow Status

**Neconfirmată** → **Confirmată** → **Finalizată**

**Neconfirmată:**
- Default la creare
- Asistent: "Confirmați programarea" → Status "Confirmată"

**Confirmată:**
- Reminder-ul se trimite doar pentru programări confirmate

**Anulată:**
- Client anulează → Asistent marchează "Anulată"
- Slot devine liber din nou

**Reprogramată:**
- Client cere altă dată → Asistent:
  - Marchează programarea veche "Reprogramată" (păstrează în istoric)
  - Creează programare nouă cu noua dată

**Finalizată:**
- După întâlnire → Asistent sau sistem automat (dacă dosar trece în "Signed") marchează "Finalizată"

---

## Client Absent (No-Show)

### Flow

1. Programare "Confirmată" pentru azi 15:00
2. Ora 15:30 - Client nu a venit
3. Asistent: Marchează programare "Client absent"
4. Sistem:
   - Adaugă note pe dosar: "Client absent programare 21.11.2025 15:00"
   - Creează task automat: "Contactează client pentru reprogramare"
   - (Optional) Flag pe client: "No-show anterior" (pentru tracking clienți nereliabili)

---

## Programare Online (Roadmap - Portal Client)

### Flow Viitor

1. **Client:** Accesează portal client LexNotar
2. **Selectare serviciu:** "Vreau să fac o vânzare-cumpărare"
3. **Calendar public:** Arată slot-uri disponibile (fără detalii despre alte programări - GDPR)
4. **Selectare slot:** Client alege Miercuri 10:00
5. **Form date minime:** Nume, Telefon, E-mail
6. **Submit:** Cerere de programare trimisă
7. **Asistent:** Primește notificare, verifică, confirmă sau respinge
8. **Client:** Primește e-mail confirmare cu detalii

### Securitate Calendar Public

- NU afișa nume clienți sau detalii dosare (doar slot-uri libere/ocupate)
- Rate limiting: Max 10 cereri de programare/zi per IP (anti-spam)

---

## Sincronizare Calendar Extern (Roadmap V2+)

### Integrare Google Calendar / Outlook

**Use case:** Notar vrea să vadă programările LexNotar în Google Calendar personal.

**Flow:**
1. Notar: Setări → "Sincronizare Google Calendar"
2. OAuth login Google
3. Sistem creează evenimente în Google Calendar pentru fiecare programare LexNotar
4. Sync bidirectional (optional): Dacă notar creează eveniment în Google Calendar în orar de lucru → blocare slot în LexNotar

**Privacy:** Sincronizează doar programările proprii, nu ale altor notari.

---

## Raportare Programări

### Statistici

- **Programări luna curentă:** Total, per notar, per tip
- **Rate ocupare:** % slot-uri ocupate vs. disponibile
- **No-show rate:** % clienți care nu vin la programări
- **Durată medie programare:** Per tip act

**Utilizare:** Optimizare program de lucru, identificare ore de vârf.

---

**[Next: Tasks & Workflow →](./03e-tasks-workflow.md)**
