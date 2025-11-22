# Annex 10: Special Workflows - Detailed Process Flows

[← Înapoi la Blueprint](../PRODUCT_BLUEPRINT.md) | [← Previous](./annex-09-external-integrations.md) | [Next →](./annex-11-compliance-detail.md)

---

## Obiectiv

Procese end-to-end pentru scenariile complexe din activitatea notarială.

---

## 10.1. Workflow: Succesiune (Moștenire)

### 10.1.1. Overview

**Durată medie:** 3-12 luni (variază cu complexitate)

**Faze:** 5 (Intake → Inventory → Identificare → Acceptare/Renunțare → Împărțeală)

**Părți implicate:** 
- Solicitant (moștenitor/mandatar)
- Toți moștenitorii (legali + testamentari)
- Credituri/debitori ai defunctului
- ANAF (impozit succesoral)
- Banca (dacă conturi bancare)

---

### 10.1.2. Faza 1: Intake & Deschidere Dosar

**Trigger:** Client vine cu certificat de deces

**Steps:**

1. **Verificare deces**
   - Upload certificat deces (PDF/scan)
   - OCR: Extract date (nume defunct, CNP, data decesului, locul decesului)
   - Validare CNP checksum

2. **Identificare solicitant**
   - KYC complet (CNP/BI)
   - Relație cu defunctul (soț, fiu, etc.)
   - Verificare dacă solicitantul = moștenitor

3. **Creare dosar succesiune**
   - `Case.Type = "Succession"`
   - `Case.SubjectMatter = "Moștenire defunctului [Nume Prenume]"`
   - Alocare număr dosar
   - Entry in Repertoriu Notarial

4. **Verificare testament**
   - Notar întreabă: "Cunoașteți existența unui testament?"
   - Dacă DA:
     - Upload testament (sau extract din Registrul Național Testamente)
     - Verificare validitate (formă autentic vs olograf)
     - Identificare legatari
   - Dacă NU: Succesiune legală (doar moștenitori legali)

**Output:** Dosar deschis, solicitant identificat, regim succesoral (legal/testamentar)

---

### 10.1.3. Faza 2: Inventory Assets (Inventar Bunuri)

**Obiectiv:** Catalogare complete estate (activ + pasiv)

**Steps:**

1. **Identificare Imobile**
   - Client aduce extrase CF
   - Notar: Solicită CF din ECRIS (pentru fiecare imobil)
   - Parsing: Adresă, nr. CF, cotă deținută de defunct
   - Evaluare: Client aduce raport evaluare SAI (evaluator autorizat)
   - Insert `Asset`:
     ```json
     {
       "type": "RealEstate",
       "description": "Apartament 3 camere, București Sect. 1, Str. X nr. Y",
       "cadastralNumber": "12345-C1-U10",
       "evaluatedValue": 150000,
       "currency": "RON",
       "evaluationDate": "2025-11-15"
     }
     ```

2. **Identificare Vehicule**
   - Client: Carte identitate vehicul (CIV)
   - Notar: Verificare RAR (VIN check via CarVertical)
   - Verificare gajuri (RAR)
   - Evaluare: Via CarVertical report sau evaluator
   - Insert `Asset`:
     ```json
     {
       "type": "Vehicle",
       "description": "Autoturism Volkswagen Golf, 2020",
       "vin": "WVWZZZ1KZBW000001",
       "licensePlate": "B-123-XYZ",
       "evaluatedValue": 45000,
       "currency": "RON"
     }
     ```

3. **Identificare Conturi Bancare**
   - Notar: Scrisoare către bănci (ING, BRD, BCR, etc.)
   - Bancă: Răspunde cu sold la data decesului
   - Insert `Asset`:
     ```json
     {
       "type": "BankAccount",
       "description": "Cont curent ING, IBAN RO49...",
       "iban": "RO49INGB0000999888777",
       "balance": 25000,
       "currency": "RON",
       "balanceDate": "2025-01-15"
     }
     ```

4. **Identificare Alte Bunuri Mobile**
   - Bijuterii, tablouri, mobilă (dacă valoare semnificativă)
   - Evaluare prin raport expert
   - Insert `Asset`:
     ```json
     {
       "type": "Movable",
       "description": "Tablou autentic Nicolae Grigorescu",
       "evaluatedValue": 80000,
       "currency": "RON"
     }
     ```

5. **Identificare Datorii (Pasiv Succesoral)**
   - Credit ipotecar (bancă confirmă sold)
   - Credite consum (ANAF: certificat fiscal)
   - Utilitati restante (client: facturi neachitate)
   - Insert `Asset` (negative value):
     ```json
     {
       "type": "Debt",
       "description": "Credit ipotecar ING, sold rămas",
       "evaluatedValue": -85000,
       "currency": "RON",
       "creditor": "ING Bank România"
     }
     ```

**Output:** Lista completă assets (active + pasive), valoare netă succesiune

---

### 10.1.4. Faza 3: Identificare Moștenitori

**Obiectiv:** Stabili cine moștenește (legal sau testamentar)

**Steps:**

1. **Moștenitori Legali (dacă nu există testament)**
   
   **Clasele de moștenitori (Codul Civil, art. 967-970):**
   
   - **Clasa I:** Descendenți (copii, nepoți) + soțul supraviețuitor
   - **Clasa II:** Părinții + soțul supraviețuitor (dacă nu copii)
   - **Clasa III:** Frații + soțul supraviețuitor (dacă nu părinți)
   - **Clasa IV:** Alte rude până la gradul IV
   
   **LexNotar: Wizard "Calculare moștenitori legali"**
   
   ```
   Wizard Step 1: "Defunctul avea copii?"
   - DA: Cât? [Input: 2]
     - Nume copii: [Input: Ion Popescu, Maria Ionescu]
     - Copiii sunt în viață? [DA pentru ambii]
   - NU: Treci la Step 2
   
   Wizard Step 2: "Defunctul era căsătorit?"
   - DA: Nume soț: [Input: Elena Popescu]
   - Regim matrimonial: [Comunitate / Separație de bunuri]
   
   Wizard Output:
   - Moștenitori: Ion Popescu (1/4), Maria Ionescu (1/4), Elena Popescu (1/2)
   - Explicație: "Conform art. 967 Cod Civil, soțul moștenește 1/2, copiii împart 1/2 în mod egal"
   ```

2. **Insert Moștenitori în BD**
   ```sql
   INSERT INTO Heir (SuccessionId, PersonId, RelationToDeceased, InheritanceQuota, IsLegal, IsTestamentary, Status)
   VALUES 
     (succession_123, person_ion, 'Fiu', 0.25, true, false, 'NotContacted'),
     (succession_123, person_maria, 'Fiică', 0.25, true, false, 'NotContacted'),
     (succession_123, person_elena, 'Soție', 0.50, true, false, 'NotContacted');
   ```

3. **Contactare Moștenitori**
   - Notar: Scrisoare recomandată + SMS/Email
   - Content: "Sunteți moștenitor legal al defunctului X. Vă rugăm prezentați la biroul notarial pentru a declara acceptarea sau renunțarea la moștenire."
   - Tracking: `Heir.Status = 'Contacted'`, `Heir.ContactedDate = NOW()`

4. **Verificare Conflict of Interest**
   - Check dacă notar = ruda defunctului sau moștenitorului
   - Check dacă notar = moștenitor (conflict grav → refuz dosar)

**Output:** Lista moștenitori (cu cote), status contactare

---

### 10.1.5. Faza 4: Acceptare / Renunțare la Moștenire

**Obiectiv:** Fiecare moștenitor declară: Acceptă / Renunță / Acceptare cu beneficiu de inventar

**Steps:**

1. **Întâlnire Individuală cu Fiecare Moștenitor**
   - Schedule appointment (Calendar)
   - Verificare identitate (KYC)
   - Explicare cote moștenire
   - Explicare activ + pasiv (datorii!)

2. **Declarație Moștenitor**
   
   **Opțiuni:**
   
   - **Acceptare pură și simplă:** Moștenește tot (activ + pasiv în limita activului)
   - **Acceptare cu beneficiu de inventar:** Pasivul nu depășește activul (protecție moștenitor)
   - **Renunțare:** Nu moștenește nimic (nici activ, nici pasiv)
   
   **LexNotar UI:**
   ```
   Moștenitor: Ion Popescu (Fiu)
   Cotă: 1/4 (25%)
   Valoare aferentă: 
     - Activ: €87,500 (din €350,000 total)
     - Pasiv: €21,250 (din €85,000 total)
     - Net: €66,250
   
   Decizie:
   [ ] Acceptare pură și simplă
   [ ] Acceptare cu beneficiu de inventar
   [ ] Renunțare la moștenire
   
   [Generează Act] [Salvează Draft]
   ```

3. **Generare Act Notarial**
   
   **Dacă Acceptare:**
   - Template: `Declarație_acceptare_moștenire.docx`
   - Variabile: 
     - `{{heir_name}}` = Ion Popescu
     - `{{heir_cnp}}` = 1234567890123
     - `{{deceased_name}}` = Gheorghe Popescu
     - `{{inheritance_quota}}` = 1/4
     - `{{acceptance_type}}` = "cu beneficiu de inventar"
   - Semnare: Moștenitor + Notar (QES sau wet signature)
   
   **Dacă Renunțare:**
   - Template: `Declarație_renunțare_moștenire.docx`
   - Variabile similare
   - **Efect:** Cota lui trece la următorii moștenitori (ex: ceilalți copii)

4. **Update Status Moștenitor**
   ```sql
   UPDATE Heir
   SET Status = 'Accepted' / 'AcceptedWithInventory' / 'Renounced',
       DeclarationDate = NOW(),
       DeclarationDocumentId = doc_id
   WHERE Id = heir_ion;
   ```

5. **Recalculare Cote (dacă renunțări)**
   - Dacă Ion renunță → Maria primește 1/2 (nu 1/4), Elena primește 1/2
   - Update `Heir.InheritanceQuota` pentru Maria

**Output:** Toți moștenitorii au declarat, cote finale stabilite

---

### 10.1.6. Faza 5: Împărțeală & Certificate de Moștenitor

**Obiectiv:** Împărțire concretă bunuri, eliberare Certificate de Moștenitor

**Steps:**

1. **Negociere Împărțeală (dacă mai mulți moștenitori)**
   
   **Scenarii:**
   
   - **Scenario A: Moștenitorii se înțeleg**
     - Ex: Ion primește apartamentul (€150k), Maria primește mașina + contul bancar (€70k), diferența = cash
     - LexNotar: Tool "Plan împărțeală"
       ```
       Moștenitor: Ion Popescu (cotă 25% = €66,250 valoare)
       Primește:
         - Apartament București (€150,000)
       Datorează celorlalți: €83,750 (diferența)
       
       Moștenitor: Maria Ionescu (cotă 25% = €66,250)
       Primește:
         - Mașină VW Golf (€45,000)
         - Cont bancar ING (€25,000)
       Primește de la Ion: €3,750 (diferența)
       
       Moștenitor: Elena Popescu (cotă 50% = €132,500)
       Primește:
         - Cash €50,000 (din cont bancar)
         - De la Ion: €80,000
       
       Total balanțat: ✓
       ```
   
   - **Scenario B: Dezacord → Vânzare prin licitație publică**
     - Notarul nu poate forța împărțeală
     - Moștenitorii trebuie să apeleze la instanță (acțiune în partaj)

2. **Plată Impozit Succesoral (ANAF)**
   
   **Cote impozit (conform Codul Fiscal, art. 115):**
   
   - **Clasa I (soț, copii, părinți):** 0% (scutire)
   - **Clasa II (rude gradul II-III):** 3%
   - **Clasa III (rude gradul IV+, terți):** 15%
   
   **LexNotar: Calcul automat impozit**
   ```
   Moștenitor: Maria Ionescu (Fiică) → Clasa I → 0% impozit
   Moștenitor: Văr Ion (Văr) → Clasa II → 3% × €20,000 = €600 impozit
   
   Generate formular D207 (Declarație impozit succesoral)
   → PDF cu date pre-completate
   → Moștenitor: Depune la ANAF + plătește
   ```

3. **Achitare Datorii Defunctului**
   - Credit ipotecar: Moștenitorii plătesc sau preiau creditul (cu acordul băncii)
   - Utilitati: Plată din contul succesoral

4. **Eliberare Certificate de Moștenitor**
   
   **Pentru fiecare moștenitor:**
   - Template: `Certificat_de_mostenitor.docx`
   - Content:
     - "Se certifică că ION POPESCU, CNP 1234567890123, este moștenitor legal al defunctului GHEORGHE POPESCU, în cotă de 1/4."
     - Lista bunuri primite (apartament specific, mașină, etc.)
     - Mențiuni: "Liber de sarcini" (dacă nu ipoteci/gajuri)
   - Înregistrare în Repertoriu Notarial
   - Insert `RepertoryEntry`:
     ```json
     {
       "actType": "Certificat de moștenitor",
       "actNumber": 2025,
       "actDate": "2025-11-21",
       "parties": "ION POPESCU",
       "subject": "Certificare calitate moștenitor defunct GHEORGHE POPESCU"
     }
     ```

5. **Transcriere Drepturi de Proprietate**
   
   **Pentru imobile:**
   - Moștenitor: Merge la OCPI (Oficiul de Cadastru) cu Certificat de Moștenitor
   - OCPI: Înscrie noul proprietar în Carte Funciară
   - Upload în LexNotar: Extract CF actualizat (proof of ownership)
   
   **Pentru vehicule:**
   - Moștenitor: Merge la RAR cu Certificat de Moștenitor
   - RAR: Eliberează CIV nou (carte identitate vehicul) pe numele moștenitorului

6. **Închidere Dosar**
   - Verify: Toți moștenitorii au Certificate
   - Verify: Toate bunurile au fost împărțite
   - Verify: Impozite plătite (upload dovezi)
   - `Case.Status = 'Closed'`
   - Archive (retention: 30 ani)

**Output:** Certificate de Moștenitor eliberate, bunuri transferate, dosar închis

---

### 10.1.7. Edge Cases & Complexități

**1. Moștenitor Minor (sub 18 ani)**
- Reprezentat de părinți/tutore legal
- Acceptare obligatorie cu beneficiu de inventar (protecție minor)

**2. Moștenitor Dispărut (nedepistabil)**
- Publicare anunț în Monitorul Oficial (cost: ~€50)
- Așteptare 6 luni
- Dacă nu apare → Cotă sa merge la următorii moștenitori

**3. Bunuri în Străinătate (ex: imobil în Italia)**
- Notar român: Certifică calitatea de moștenitor
- Proces de transcriere: În țara unde e bunul (cu apostilă pe Certificat)

**4. Testament cu Clauză Substituție**
- "Dacă Ion moare, cota lui merge la Maria"
- Check validitate substituție (conform Cod Civil, art. 1056)

---

## 10.2. Workflow: Conflict of Interest Detection

### 10.2.1. Overview

**Obiectiv:** Preveni semnarea actelor cu conflict de interese (ex: notar vinde propriul imobil, notar = ruda părții)

**Bază legală:** Legea 36/1995, art. 25 ("Notarul nu poate îndeplini acte dacă... are interes în cauză")

---

### 10.2.2. Detection Algorithm

**Trigger:** La crearea unui nou Case sau adăugare Part (CaseParty)

**Steps:**

1. **Extract Relații din Case**
   ```sql
   SELECT 
     cp.PersonId, 
     cp.Role,
     p.Name,
     p.Cnp
   FROM CaseParty cp
   JOIN Person p ON cp.PersonId = p.Id
   WHERE cp.CaseId = @NewCaseId;
   ```

2. **Check Conflict Type 1: Notar = Parte în Tranzacție**
   ```sql
   SELECT COUNT(*)
   FROM CaseParty cp
   JOIN User u ON cp.PersonId = u.PersonId
   WHERE cp.CaseId = @NewCaseId
     AND u.Role = 'Notary'
     AND cp.Role IN ('Buyer', 'Seller', 'Heir', 'Donor', 'Beneficiary');
   ```
   **If COUNT > 0:** **CONFLICT GRAV** → Refuz total

3. **Check Conflict Type 2: Notar = Rudă Parte (până la gradul III)**
   
   **Relations Lookup Table:**
   ```sql
   CREATE TABLE PersonRelation (
     Id UUID PRIMARY KEY,
     Person1Id UUID REFERENCES Person(Id),
     Person2Id UUID REFERENCES Person(Id),
     RelationType VARCHAR(50) -- 'Spouse', 'Parent', 'Child', 'Sibling', 'Grandparent', etc.
     Degree INT -- 1 = soț/copil/părinte, 2 = nepot/bunică, 3 = văr
   );
   ```
   
   **Query:**
   ```sql
   SELECT COUNT(*)
   FROM CaseParty cp
   JOIN PersonRelation pr ON cp.PersonId = pr.Person2Id
   JOIN User u ON pr.Person1Id = u.PersonId
   WHERE cp.CaseId = @NewCaseId
     AND u.Role = 'Notary'
     AND pr.Degree <= 3;
   ```
   **If COUNT > 0:** **CONFLICT MEDIU** → Posibil cu consimțământ scris al părților

4. **Check Conflict Type 3: Părți Adverse din Același Case Reprezentate de Același Avocat/Mandatar**
   ```sql
   SELECT MandatarId, COUNT(DISTINCT Role) AS RoleCount
   FROM CaseParty
   WHERE CaseId = @NewCaseId
     AND MandatarId IS NOT NULL
     AND Role IN ('Buyer', 'Seller')
   GROUP BY MandatarId
   HAVING RoleCount > 1;
   ```
   **If ROWS > 0:** **CONFLICT** → Cumpărător și vânzător nu pot avea același mandatar

5. **Check Conflict Type 4: Notarul a Participat la Act Anterior între Aceleași Părți (în ultimele 12 luni)**
   ```sql
   SELECT COUNT(*)
   FROM Case c1
   JOIN CaseParty cp1 ON c1.Id = cp1.CaseId
   WHERE c1.NotaryUserId = @CurrentNotaryId
     AND c1.Id != @NewCaseId
     AND c1.CreatedDate >= NOW() - INTERVAL '12 months'
     AND EXISTS (
       SELECT 1 
       FROM CaseParty cp2
       WHERE cp2.CaseId = @NewCaseId
         AND cp2.PersonId = cp1.PersonId
     );
   ```
   **If COUNT > 3:** **SUSPICIUNE** → Posibil conflict (prea multe acte între aceleași persoane)

6. **Insert Conflict Log**
   ```sql
   INSERT INTO ConflictOfInterest (CaseId, ConflictType, DetectedDate, Severity, Status, Description)
   VALUES (
     @NewCaseId,
     'NotaryIsRelative',
     NOW(),
     'Medium',
     'UnderReview',
     'Notarul POPESCU Maria este mătușa cumpărătorului ION IONESCU'
   );
   ```

**Output:** Flag conflict în UI, notificare notar

---

### 10.2.3. Conflict Resolution Workflow

**UI: Warning Banner în Case Detail**
```
⚠️ CONFLICT OF INTEREST DETECTAT
Tip: Notar = Rudă Parte (Grad 3)
Detalii: Notarul POPESCU Maria este mătușa cumpărătorului ION IONESCU
Acțiuni posibile:
  [ ] Obține consimțământ scris părți (download template)
  [ ] Transferă dosarul la alt notar din birou
  [ ] Refuză dosarul (dacă conflict grav)
```

**Steps:**

1. **Dacă Conflict Mediu (rezolvabil):**
   - Generare formular "Consimțământ privind potențialul conflict de interese"
   - Template:
     ```
     "Subsemnatul ION IONESCU, CNP 1234567890123, declar că sunt conștient că notarul POPESCU Maria este mătușa mea, dar consimțim încheierea actului notarial de vânzare-cumpărare, înțelegând posibilul conflict de interese."
     ```
   - Semnare: Toate părțile (cumpărător + vânzător)
   - Upload în dosar
   - Update: `ConflictOfInterest.Status = 'Resolved'`, `ConflictOfInterest.ResolutionMethod = 'WrittenConsent'`

2. **Dacă Conflict Grav (nerezolvabil):**
   - UI: Button "Transferă dosar la [Alte Notare din Birou]"
   - Select alt notar (fără conflict)
   - Update: `Case.NotaryUserId = @NewNotaryId`
   - Notificare: Notar nou preia dosarul
   - Update: `ConflictOfInterest.Status = 'Resolved'`, `ConflictOfInterest.ResolutionMethod = 'TransferredToAnotherNotary'`

3. **Dacă Imposibil de Rezolvat:**
   - Button "Refuză dosar"
   - `Case.Status = 'Rejected'`
   - `Case.RejectionReason = 'Conflict of Interest'`
   - Notificare client: "Din motive legale, biroul nostru nu poate prelua acest dosar"

**Output:** Conflict rezolvat sau dosar refuzat

---

## 10.3. Workflow: Procură (Power of Attorney)

### 10.3.1. Overview

**Durată:** 30-60 minute (simplă), 2-3 ore (complexă, cu apostilă)

**Părți:** Mandant (dă puterea) + Mandatar (primește puterea)

**Tip procură:**
- **Specială:** Pentru un act specific (ex: "vinde apartamentul de pe Str. X")
- **Generală:** Pentru mai multe acte (ex: "administrare toate proprietăți")

---

### 10.3.2. Steps

1. **Client Intake**
   - Mandant: KYC complet
   - Mandatar: Date (nume, CNP/număr BI)
   - Scopul procurii: [Input liber text: "Vânzare apartament București, Str. X nr. Y"]

2. **Verificare Capacitate Civilă Mandant**
   - Check: Mandant > 18 ani
   - Check: Mandant nu este interzis (nu există tutelă)
   - **Red flag:** Dacă mandant > 75 ani → Notar verifică discernământ (dialog, întrebări simple)

3. **Selectare Template Procură**
   
   **Opțiuni:**
   - Procură specială vânzare imobil
   - Procură generală administrare bunuri
   - Procură pentru reprezentare în fața autorităților
   - Procură pentru retragere numerar (bancar)
   
   **LexNotar:** Dropdown select template

4. **Completare Formular Procură**
   
   **Variabile:**
   - `{{mandant_name}}` = Popescu Ion
   - `{{mandant_cnp}}` = 1234567890123
   - `{{mandatar_name}}` = Ionescu Maria
   - `{{mandatar_cnp}}` = 2850202234567
   - `{{procura_scope}}` = "Vânzarea apartamentului situat în București, Sectorul 1, Str. Exemplu nr. 10, ap. 5, înscris în CF nr. 12345-C1-U10"
   - `{{procura_duration}}` = "12 luni de la data autentificării" sau "până la finalizarea actului de vânzare"
   - `{{substitution_allowed}}` = DA/NU ("Mandatarul poate substitui puterile către o altă persoană")

5. **Verificare Conflict of Interest**
   - Check: Mandatar != Notar
   - Check: Mandatar != Ruda notarului

6. **Citire Procură în Fața Mandantului**
   - Notar: Citește cu voce tare toate clauzele
   - Explică efecte juridice (mandatarul poate vinde fără prezența mandantului!)
   - Mandant: Confirmă înțelegerea

7. **Semnare Procură**
   - Mandant: Semnează în fața notarului (wet signature sau QES)
   - Notar: Semnează + Aplică sigiliu notarial
   - Insert `Document` (type: "PowerOfAttorney")
   - Insert `RepertoryEntry` (procura = act notarial, se înregistrează în Repertoriu)

8. **Înregistrare în Registrul Procurilor**
   ```sql
   INSERT INTO PowerOfAttorney (
     CaseId, 
     MandantPersonId, 
     MandatarPersonId, 
     Scope, 
     IssueDate, 
     ExpiryDate,
     CanSubstitute,
     Status
   )
   VALUES (
     @CaseId,
     @MandantId,
     @MandatarId,
     'Vânzare apartament...',
     NOW(),
     NOW() + INTERVAL '12 months',
     false,
     'Active'
   );
   ```

9. **Eliberare Copii Procură**
   - Mandant primește: 1 exemplar original (copie legalizată)
   - Mandatar primește: 1 exemplar original
   - Birou notar păstrează: Minuta (original în arhivă 30 ani)

10. **Apostilă (dacă folosire internațională)**
    - Ex: Procură pentru vânzare imobil în Italia
    - Notar: Solicită apostilă de la Curtea de Apel
    - Cost: €10-30, durată 3-5 zile
    - Apostila = ștampilă pe procură (certifica semnătura notarului pentru autorități străine)

**Output:** Procură emisă, înregistrată, copii eliberate

---

### 10.3.3. Monitoring & Expiry

**Scheduled Job (daily):**
```sql
SELECT * FROM PowerOfAttorney
WHERE Status = 'Active'
  AND ExpiryDate <= NOW() + INTERVAL '30 days';
```

**Alert:** Email către mandant cu 30 zile înainte de expirare ("Procura dvs. expiră pe data X. Dacă doriți prelungire, contactați biroul notarial.")

**Revocarea Procurii:**
- Mandant: Poate revoca oricând (chiar dacă procura nu a expirat)
- Process:
  1. Mandant: Solicită revocare (în scris)
  2. Notar: Întocmește "Act de revocare procură"
  3. Update: `PowerOfAttorney.Status = 'Revoked'`, `PowerOfAttorney.RevokedDate = NOW()`
  4. Notificare mandatar: "Procura nr. X din data Y a fost revocată"

---

## 10.4. Workflow: Vânzare-Cumpărare Imobil (End-to-End)

### 10.4.1. Overview

**Durată:** 2-6 săptămâni (de la intake la semnare)

**Părți:** Vânzător + Cumpărător (± mandatari, ± bancă dacă credit)

**Etape:** 30 steps (simplificat mai jos în 10 faze majore)

---

### 10.4.2. Faze Majore

**Faza 1: Intake & Verificări Preliminare (Zi 1-3)**

1. **Identificare Părți**
   - Vânzător: KYC (CNP, BI, verificare ANAF dacă PJ)
   - Cumpărător: KYC similar
   - Verificare conflict of interest

2. **Colectare Documente Imobil**
   - Extract Carte Funciară (ECRIS) - vânzător aduce sau notar solicită
   - Act proprietate vânzător (act donație / cumpărare / succesiune anterior)
   - Certificat urbanism (opțional, dar recomandat)

**Faza 2: Verificare Juridică Imobil (Zi 4-7)**

3. **Analiza Carte Funciară**
   - Check: Vânzător = proprietar înscris în CF?
   - Check: Există sarcini? (Ipoteci, interdicții, poprituri)
   - **Red flag:** Ipoteca activă → Trebuie stinsă înainte de vânzare (sau preluată de cumpărător cu acordul băncii)
   - Check: Adresa din CF = adresa declarată de vânzător?

4. **Verificare Fiscală Vânzător**
   - ANAF: Certificat fiscal (vânzător nu are datorii la stat?)
   - **Obligatoriu pentru semnare:** Certificat fiscal valabil (max 30 zile vechime)

5. **Verificare Pre-empțiune**
   - Check: Există coproprietari? (Dacă DA, aceștia au drept de preempțiune = prioritate la cumpărare)
   - Dacă DA: Notar trimite notificare coproprietari ("Doriți să cumpărați în condițiile ofertate?")
   - Așteptare 30 zile răspuns
   - Dacă refuză sau nu răspund → Cumpărătorul extern poate proceda

**Faza 3: Negociere Preț & Antecontract (Zi 8-10)**

6. **Stabilire Preț & Modalitate Plată**
   - Preț vânzare: €150,000
   - Modalitate:
     - €15,000 avans (la antecontract)
     - €135,000 la semnarea actului final (din care €100,000 credit bancar + €35,000 fonduri proprii)

7. **Întocmire Antecontract**
   - Template: `Antecontract_vanzare_cumparare.docx`
   - Clauze:
     - Preț, avans, termen finalizare (ex: 45 zile)
     - Penalități dacă vânzătorul se răzgândește (returnează avans dublu)
     - Penalități dacă cumpărătorul se răzgândește (pierde avans)
   - Semnare antecontract: Ambele părți + notar
   - Insert `RepertoryEntry` (antecontract = act notarial)

**Faza 4: Finanțare (Credit Bancar) - Dacă Aplicabil (Zi 11-30)**

8. **Cumpărător Solicită Credit Ipotecar**
   - Bancă: Analizează dosar (venit, istoric credite)
   - Bancă: Evaluare imobil (evaluator autorizat)
   - Bancă: Aprobă credit (€100,000, dobândă 6.5%, 25 ani)
   - Bancă: Emit scrisoare avizare credit (condition: ipoteca grad I asupra imobilului)

**Faza 5: Obținere Documente Finale (Zi 31-40)**

9. **Certificat Fiscal Vânzător Actualizat**
   - Request nou certificat ANAF (max 30 zile vechime la semnare)

10. **Certificat Energetic**
    - Obligatoriu pentru vânzare (din 2013)
    - Vânzător: Angajează auditor energetic (cost: €50-150)
    - Upload certificat în LexNotar

11. **Extras CF Actualizat**
    - Notar: Solicită CF cu 1-2 zile înainte de semnare (ensure no new liens)

**Faza 6: Draft Act de Vânzare-Cumpărare (Zi 41-43)**

12. **Generare Act din Template**
    - Template: `Act_vanzare_cumparare_imobil.docx`
    - Variabile: 150+ (părți, imobil, preț, modalitate plată, etc.)
    - Clauze speciale:
      - Preluare credit (dacă aplicabil)
      - Clauze de garanție (vânzător garantează că imobilul e liber de vicii ascunse)
      - Termen evacuare (ex: vânzătorul evacuează în 30 zile de la semnare)

13. **Verificare Act de Asistent/Alt Notar**
    - Peer review (reduce erori)
    - Check: Toate clauzele corecte, date corecte, calcule taxe corecte

**Faza 7: Plata Taxelor & Impozitelor (Zi 44)**

14. **Calcul Impozit Vânzător**
    - **Dacă vânzătorul deține imobilul > 3 ani:** 0% impozit (scutire)
    - **Dacă vânzătorul deține < 3 ani:** 3% impozit pe câștig (preț vânzare - preț cumpărare)
    - Ex: Cumpărat 2023 la €100k, vândut 2025 la €150k → Câștig €50k → Impozit 3% × €50k = €1,500

15. **Plată Taxă Notarială**
    - Conform OUG 119/2022, art. 1 (taxa progresivă)
    - Ex: Preț €150,000:
      - 0-50k → €500
      - 50k-100k → 1% × €50k = €500
      - 100k-150k → 0.5% × €50k = €250
      - **Total taxă:** €1,250
    - Plătitor: Cumpărător (uzanță, dar negociabil)

16. **Plată Taxă OCPI (Oficiul de Cadastru)**
    - Cost transcriere în CF: €40-100 (fix)

**Faza 8: Semnare Act Notarial (Zi 45)**

17. **Întâlnire Finală Părți**
    - Location: Biroul notarial
    - Prezent: Vânzător, Cumpărător, Notar, (opțional: Reprezentant bancă)
    - Verificare ultimă identități (BI valabil)

18. **Citire Act**
    - Notar: Citește actul complet cu voce tare (obligație legală)
    - Durata: 15-30 minute
    - Părți: Confirmă înțelegerea

19. **Transfer Fonduri**
    - Cumpărător: Transfer bancar €135,000 către vânzător (IBAN)
    - **Securitate:** Transfer în prezența notarului sau prin escrow notarial (notar deține fonduri temporar)

20. **Semnare Act**
    - **Opțiune A (Wet Signature):**
      - Vânzător semnează cu mâna pe hârtie
      - Cumpărător semnează
      - Notar semnează + Sigiliu notarial
    - **Opțiune B (QES - Semnătură Electronică):**
      - Upload act în Certinomis
      - Vânzător: Semnează cu certificat digital (SMS OTP)
      - Cumpărător: Similar
      - Notar: Semnează cu certificat digital notarial
      - Download act semnat (PDF cu semnături vizibile)

21. **Înregistrare Repertoriu**
    - Insert `RepertoryEntry`:
      ```json
      {
        "actType": "Vânzare-Cumpărare",
        "actNumber": 2026,
        "actDate": "2025-12-15",
        "parties": "Vânzător: POPESCU Ion, Cumpărător: IONESCU Maria",
        "subject": "Apartament 3 camere, București Sector 1, Str. X nr. Y, CF 12345-C1-U10",
        "value": 150000,
        "currency": "EUR",
        "tax": 1250
      }
      ```

**Faza 9: Transcriere în Carte Funciară (Zi 46-50)**

22. **Depunere Documentație la OCPI**
    - Cumpărător (sau notar în numele lui): Depune la OCPI:
      - Act vânzare-cumpărare (original)
      - Cerere transcriere
      - Dovadă plată taxă OCPI
    - OCPI: Procesare 3-10 zile lucrătoare

23. **Înregistrare Nouă Proprietate**
    - OCPI: Actualizează CF → Cumpărătorul devine proprietar înscris
    - Cumpărător: Primește extras CF actualizat (proof of ownership)

**Faza 10: Constituire Ipotecă (Dacă Credit) & Finalizare (Zi 51-60)**

24. **Act Constituire Ipotecă**
    - Între: Cumpărător (debitor) + Bancă (creditor)
    - Notar: Întocmește act ipotecă (grad I, valoare €100,000)
    - Semnare: Cumpărător + Reprezentant bancă + Notar
    - Insert `RepertoryEntry` (ipoteca = act notarial separat)

25. **Transcriere Ipotecă în CF**
    - Bancă: Depune act ipotecă la OCPI
    - OCPI: Înscrie ipoteca în Secțiunea C (Sarcini) a CF
    - Bancă: Primește extras CF cu ipoteca înscrisă (garanție)

26. **Plată Credit către Vânzător**
    - Bancă: Virează €100,000 către vânzător (după confirmare ipotecă înscrisă)

27. **Evacuare Vânzător (Dacă Aplicabil)**
    - Vânzător: Părăsește imobilul în termenul stipulat (ex: 30 zile)
    - Predare chei către cumpărător

28. **Actualizare Utilitati**
    - Cumpărător: Schimbă contracte utilități (energie, gaz, apă) pe numele său
    - Upload facturi în LexNotar (proof)

29. **Actualizare Asigurare Imobil**
    - Cumpărător: Asigurare obligatorie PAD (contra cutremur)
    - Bancă: Solicită și asigurare facultativă (incendiu, inundație)

30. **Închidere Dosar**
    - Verify: Toate documente complete
    - Verify: CF actualizată cu noul proprietar
    - Verify: Ipoteca înscrisă (dacă aplicabil)
    - `Case.Status = 'Closed'`
    - Archive (retention: 30 ani)

**Output:** Imobil vândut, proprietate transferată, dosar finalizat

---

**[Next: Compliance Detail →](./annex-11-compliance-detail.md)**
