# 🧪 LexNotar - Ghid de Testare Funcționalități

## 🚀 Statusul Serverelor

### Backend
- **URL**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/api/v1/health
- **Status**: ✅ RUNNING

### Frontend
- **URL**: http://localhost:5173
- **Status**: ✅ RUNNING

### Database
- **PostgreSQL**: localhost:5432
- **Database**: lexnotar
- **Status**: ✅ RUNNING (Docker)

---

## 📋 Checklist Funcționalități Noi

### 1. ✨ Dark Mode Theme
**Cum să testezi:**
1. Deschide aplicația la http://localhost:5173
2. Loghează-te cu user existent
3. În bara de navigație (top-right), caută iconița 🌙 (Moon)
4. Click pe iconița → interfața devine dark mode
5. Click din nou → revine la light mode
6. Reîmprospătează pagina → tema se păstrează (localStorage)

**Ce să verifici:**
- [ ] Iconița se schimbă între 🌙 (Moon) și ☀️ (Sun)
- [ ] Toate paginile aplicau tema dark/light
- [ ] Textul este lizibil în ambele teme
- [ ] Tema se păstrează după refresh

---

### 2. 🌐 Internationalization (i18n)
**Cum să testezi:**
1. În bara de navigație, caută butonul cu 🌐 și text "RO" sau "EN"
2. Click pe buton → limba se schimbă instant
3. Navighează prin pagini diferite (Dashboard, Cases, Clients, etc.)
4. Verifică că toate textele sunt traduse

**Ce să verifici:**
- [ ] Butonul arată "RO" când limba curentă este Română
- [ ] Butonul arată "EN" când limba curentă este Engleză
- [ ] Meniul de navigație este tradus
- [ ] Butoanele (Save, Cancel, Delete, etc.) sunt traduse
- [ ] Limba se păstrează după refresh

**Traduceri cheie:**
- **RO**: Tablou de Bord, Dosare, Clienți, Documente, Calendar, Sarcini
- **EN**: Dashboard, Cases, Clients, Documents, Calendar, Tasks

---

### 3. ⌨️ Keyboard Shortcuts
**Cum să testezi:**
1. Pe orice pagină din aplicație, apasă tasta **?** (Shift + /)
2. Se deschide un modal cu lista tuturor shortcuts
3. Testează fiecare shortcut:
   - `Ctrl + K` → Focus pe search bar
   - `Ctrl + D` → Navighează la Dashboard
   - `Ctrl + Shift + C` → Navighează la Cases
   - `Ctrl + Shift + L` → Navighează la Clients
   - `Ctrl + Shift + T` → Navighează la Tasks
   - `Ctrl + Shift + M` → Navighează la Documents
   - `Ctrl + Shift + A` → Navighează la Calendar

**Ce să verifici:**
- [ ] Modal-ul se deschide cu "?"
- [ ] Toate shortcuts sunt afișate cu descrieri
- [ ] Shortcuts funcționează când NU ești într-un input field
- [ ] Shortcuts NU se declanșează când scrii într-un input
- [ ] Modal-ul se închide cu X sau ESC

---

### 4. 🎓 Onboarding Wizard
**Cum să testezi:**
1. **Pentru utilizatori noi**: La prima autentificare, wizard-ul apare automat după 1 secundă
2. **Pentru utilizatori existenți**: 
   - Mergi la `/settings` în browser
   - Click pe butonul "Start Tour" din secțiunea "Help & Tutorials"
3. Parcurge toate cele 5 pași:
   - **Step 1**: Welcome to LexNotar
   - **Step 2**: Create Your First Case
   - **Step 3**: Upload Documents
   - **Step 4**: Manage Clients
   - **Step 5**: Schedule Events
4. Testează butoanele:
   - "Next" → avansează la următorul pas
   - "Previous" → revine la pasul anterior
   - "Skip Tour" → închide wizard-ul

**Ce să verifici:**
- [ ] Progress bar avansează cu fiecare pas (1/5, 2/5, etc.)
- [ ] Iconițele sunt vizibile pentru fiecare pas
- [ ] Butoanele de acțiune (Create Case, Upload Document, etc.) funcționează
- [ ] Wizard-ul se închide după ultimul pas
- [ ] Flag-ul se salvează în localStorage (`onboarding_completed`)
- [ ] Wizard-ul NU mai apare automat după completare

---

### 5. 📄 File Preview System
**Cum să testezi:**
1. Navighează la Documents (`/documents`)
2. Click pe un document din listă
3. În pagina de detalii, click pe butonul "Preview" (👁 icon)
4. Se deschide modal cu preview-ul fișierului

**Tipuri de fișiere suportate:**
- **PDF**: Afișat în iframe cu zoom controls
- **Imagini** (jpg, png, gif): Afișate responsive cu loading spinner
- **Video** (mp4, webm): Player HTML5 cu controls
- **Audio** (mp3, wav): Player HTML5 cu controls
- **Text/JSON**: Afișat în iframe

**Ce să verifici:**
- [ ] Modal-ul se deschide full-screen
- [ ] Preview-ul se încarcă corect
- [ ] Butonul "Download" funcționează
- [ ] Butonul "X" închide modal-ul
- [ ] Loading spinner apare la încărcare
- [ ] Erori sunt afișate pentru fișiere corupte

---

### 6. ⚙️ Settings Page
**Cum să testezi:**
1. Click pe "Settings" în navigație (sau mergi la `/settings`)
2. Verifică secțiunile:
   - **General Settings**: Info despre Language și Theme switchers
   - **Help & Tutorials**: 
     - Buton "Start Tour" pentru restart onboarding
     - Info despre keyboard shortcuts
   - **System Information**: 
     - Version: 1.0.0
     - Environment: development/production
     - API Status: Connected

**Ce să verifici:**
- [ ] Pagina se încarcă fără erori
- [ ] Butonul "Start Tour" deschide onboarding wizard
- [ ] Informațiile de sistem sunt corecte
- [ ] Design-ul este consistent cu restul aplicației

---

## 🐛 Debugging Tips

### Frontend nu pornește
```bash
cd /workspaces/LexNotar/frontend
pkill -f vite
npm run dev
```

### Backend nu pornește
```bash
cd /workspaces/LexNotar/backend
pkill -f "nest start"
npm run start:dev
```

### Database nu răspunde
```bash
docker ps | grep postgres
docker start lexnotar-postgres
```

### Verificare Health Check
```bash
# Backend
curl http://localhost:3000/api/v1/health

# Frontend
curl -I http://localhost:5173
```

---

## 📊 Expected Results

### Toate funcționalitățile ar trebui să funcționeze:
✅ Dark mode toggle (Moon/Sun icon)
✅ Language switcher (RO/EN with Globe icon)
✅ Keyboard shortcuts (Press "?" to see modal)
✅ Onboarding wizard (5 steps with progress bar)
✅ File preview modal (PDF, images, video, audio, text)
✅ Settings page (restart onboarding, system info)

### Performance Metrics:
- Backend startup: ~3 seconds
- Frontend startup: ~1 second
- Page load time: < 500ms
- Theme switch: instant (0.3s transition)
- Language switch: instant

---

## 🎯 Demo Scenario

**Scenariul complet de testare (5 minute):**

1. **Login** → http://localhost:5173/login
2. **Onboarding** → Apare automat după 1s (pentru utilizatori noi)
3. **Dark Mode** → Click pe 🌙 în top-right
4. **Language** → Click pe 🌐 RO/EN
5. **Keyboard Shortcuts** → Press "?"
6. **Navigation cu shortcuts**:
   - `Ctrl+D` → Dashboard
   - `Ctrl+Shift+C` → Cases
   - `Ctrl+Shift+L` → Clients
7. **File Preview** → Documents → Click document → Preview button
8. **Settings** → Click Settings → Restart Tour

**Durata estimată**: 5-10 minute pentru testare completă

---

## 📞 Suport

Dacă întâmpini probleme:
1. Verifică că toate serverele rulează (backend, frontend, database)
2. Deschide Developer Console (F12) pentru erori JavaScript
3. Verifică Network tab pentru request-uri failed
4. Verifică localStorage pentru flag-uri salvate

**Log files:**
- Backend: Terminal output (npm run start:dev)
- Frontend: Browser Console (F12)
- Database: `docker logs lexnotar-postgres`

---

🎉 **Succes la testare!**
