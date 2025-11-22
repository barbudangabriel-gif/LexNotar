# Instrucțiuni Copilot - LexNotar Project

## 📋 Context General

**Proiect**: LexNotar - Platformă de management pentru birouri notariale  
**Stack**: NestJS (Backend) + React + Vite (Frontend) + PostgreSQL  
**Environment**: GitHub Codespaces  
**Data**: Noiembrie 2025

---

## 🎯 Ce Am Implementat

### ✅ Features Majore Complete (6/6)

1. **Documentation & Deployment**
   - README-DEV.md (ghid dezvoltare)
   - DEPLOYMENT.md (ghid producție)
   - docker-compose.yml (orchestrare servicii)
   - Dockerfiles (backend + frontend)
   - setup.sh (script instalare interactiv)
   - GitHub Actions CI/CD pipeline

2. **File Preview System**
   - FilePreviewModal.tsx (230+ linii)
   - Suport: PDF, imagini, video, audio, text
   - Integrat în DocumentDetailPage
   - Icoane lucide-react

3. **Dark Mode Theme**
   - ThemeContext.tsx + ThemeToggle.tsx
   - Default: Dark mode
   - Persistență localStorage
   - Tranziții smooth (0.3s)
   - Stilizare completă inputs în dark mode

4. **Internationalization (i18n)**
   - i18next + react-i18next + i18next-http-backend
   - Limbi: RO (default) + EN
   - LanguageSwitcher.tsx (Globe icon)
   - Traduceri complete în /src/locales/

5. **Keyboard Shortcuts**
   - useKeyboardShortcuts.ts (8 shortcuts)
   - KeyboardShortcutsHelp.tsx (modal help)
   - Shortcuts: Ctrl+K, Ctrl+D, Ctrl+Shift+C/L/T/M/A, ?
   - Dezactivate în input fields

6. **Onboarding Wizard**
   - OnboardingContext.tsx + OnboardingWizard.tsx
   - 5 pași interactivi
   - Skip option + localStorage tracking
   - Re-trigger din Settings

---

## 🐛 Probleme Critice Rezolvate

### Issue #1: White Page Crisis
**Simptome**: Pagină complet albă după deployment  
**Root Cause #1**: useTranslation() hook apelat înainte de inițializare i18n  
**Root Cause #2**: useNavigate() apelat în afara context-ului Router  

**Soluție**:
```tsx
// Structură corectă App.tsx:
App() → Providers
  └─ AppContent() → BrowserRouter
      └─ AppRoutes() → useKeyboardShortcuts + Routes
```

**Fix i18n**:
- Trecut de la import direct JSON la i18next-http-backend
- Adăugat `useSuspense: false` în config
- Backend loading async: `/src/locales/{{lng}}.json`

### Issue #2: i18n Initialization Race
**Problemă**: JSON import sincron blocant  
**Soluție**: HTTP backend pentru loading async

```typescript
// Înainte (GREȘIT):
import roTranslations from '../locales/ro.json';
i18n.init({ resources: { ro: { translation: roTranslations } } });

// După (CORECT):
import HttpBackend from 'i18next-http-backend';
i18n.use(HttpBackend).init({
  backend: { loadPath: '/src/locales/{{lng}}.json' },
  react: { useSuspense: false }
});
```

### Issue #3: Authentication Loop
**Problemă**: Login reușit dar redirect înapoi la login  
**Cauză**: Backend returnează `{accessToken, refreshToken}` (camelCase)  
         Frontend aștepta `{access_token, refresh_token}` (snake_case)

**Fix**:
```typescript
// types/index.ts
interface AuthResponse {
  accessToken: string;   // NU access_token
  refreshToken: string;  // NU refresh_token
  user: User;
}

// AuthContext.tsx
localStorage.setItem('access_token', response.accessToken);
localStorage.setItem('refresh_token', response.refreshToken);
```

### Issue #4: Tailwind CSS v4 Incompatibility
**Problemă**: `@tailwind` directives nu sunt suportate în v4  
**Soluție**: Downgrade la tailwindcss@^3

```bash
npm uninstall @tailwindcss/postcss
npm install -D tailwindcss@^3 postcss autoprefixer
```

### Issue #5: Sidebar Layout Mismatch
**Problemă**: Header orizontal în loc de sidebar vertical  
**Soluție**: Rewrite complet DashboardLayout.tsx

**Structură finală**:
```tsx
<div className="flex">
  <aside className="w-64 bg-gray-800"> // Sidebar stânga
    <div className="h-16 bg-gray-900">  // Logo + collapse
    <nav>                                // Navigation items
    <div className="mt-auto">            // User profile
  </aside>
  <div className="flex-1 flex flex-col">
    <header>                             // Search + icons
    <main>                               // <Outlet />
```

### Issue #6: Dark Mode Input Brightness
**Problemă**: Câmpuri albe prea strălucitoare în dark mode  
**Soluție**: CSS global în index.css

```css
input, textarea, select {
  @apply dark:bg-gray-600 dark:border-gray-500 
         dark:text-white dark:placeholder-gray-300;
}
input:focus, textarea:focus, select:focus {
  @apply dark:bg-gray-500 dark:border-indigo-400;
}
```

### Issue #7: Logo PNG Loading Failure
**Problemă**: Logo PNG nu se încarcă din /public/  
**Status**: NEREZOLVAT - folosim text "LexNotar" ca fallback  
**TODO**: Încercare alternativă cu import ca modul sau SVG inline

---

## 🔧 Configurație Tehnică

### Backend (NestJS)
- **Port**: 3000
- **Database**: PostgreSQL 16 (Docker container: lexnotar-postgres)
- **Auth**: JWT tokens (accessToken + refreshToken)
- **Password**: bcrypt cu cost factor 10
- **Logs**: /tmp/backend.log
- **Startup**: `npm run start:dev` (nohup background)

### Frontend (Vite + React)
- **Port**: 5173
- **Build Tool**: Vite 7.2.4
- **CSS**: Tailwind CSS v3
- **Icons**: lucide-react
- **i18n**: i18next-http-backend
- **State**: React Query + Context API
- **Routing**: react-router-dom v6
- **Logs**: /tmp/vite.log
- **Startup**: `npm run dev -- --host 0.0.0.0` (nohup background)

### Database
- **Container**: eaac532212ac (lexnotar-postgres)
- **Port**: 5432
- **Network**: lexnotar-network
- **Volume**: lexnotar_postgres_data
- **Credentials**:
  - Email: admin@lexnotar.ro
  - Parola: LexNotar2025!

### Codespaces Specifics
- **Proxy Vite**: `/api` → `http://localhost:3000/api/v1`
- **Host**: `--host 0.0.0.0` pentru accesibilitate
- **Port Forwarding**: 3000, 5173, 5432

---

## 📁 Fișiere Modificate (Prioritate Înaltă)

### 🔴 CRITICAL FILES (Refăcute complet)

1. **frontend/src/App.tsx**
   - Structură nouă: App → AppContent → AppRoutes
   - useKeyboardShortcuts mutat în AppRoutes (după BrowserRouter)
   - Fix: "useNavigate must be in Router context"

2. **frontend/src/i18n/config.ts**
   - Înlocuit JSON import direct cu HttpBackend
   - Async loading din /src/locales/{{lng}}.json
   - useSuspense: false

3. **frontend/src/context/AuthContext.tsx**
   - response.access_token → response.accessToken
   - response.refresh_token → response.refreshToken
   - Fix: Token storage mismatch

4. **frontend/src/types/index.ts**
   - AuthResponse: camelCase (nu snake_case)
   - accessToken, refreshToken (nu access_token, refresh_token)

5. **frontend/src/components/DashboardLayout.tsx**
   - Rewrite complet: header orizontal → sidebar vertical
   - Navigation array cu 9 items
   - User profile section la bottom
   - Collapse functionality (w-64 ↔ w-20)

6. **frontend/src/index.css**
   - Dark mode styles pentru input/textarea/select
   - Culori: gray-600 background, gray-500 focus
   - Text white, placeholder gray-300

7. **frontend/src/context/ThemeContext.tsx**
   - Force dark theme ca default
   - Ignoră localStorage + system preference

8. **frontend/src/pages/LoginPage.tsx**
   - Dark mode complet (bg-gray-900)
   - Input fields: bg-gray-700, border-gray-600
   - Demo credentials actualizate: LexNotar2025!

9. **frontend/src/main.tsx**
   - Wrapped cu ErrorBoundary
   - Catches React errors cu stack trace

10. **frontend/src/components/ErrorBoundary.tsx**
    - Nou creat
    - Displays error message + stack trace
    - "Reload Page" button

---

## 🚀 Procesul de Deployment

### Start Backend
```bash
cd /workspaces/LexNotar/backend
nohup npm run start:dev > /tmp/backend.log 2>&1 &
```

### Start Frontend
```bash
cd /workspaces/LexNotar/frontend
nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 &
```

### Check Services
```bash
# Backend health
curl http://localhost:3000/api/v1/health

# Frontend
curl http://localhost:5173

# Database
docker ps | grep lexnotar-postgres

# Logs
tail -f /tmp/backend.log
tail -f /tmp/vite.log
```

### Reset Password
```bash
cd /workspaces/LexNotar/backend
node reset-password.js
# Copy SQL command
docker exec -i lexnotar-postgres psql -U lexnotar -d lexnotar -c "UPDATE users SET password = '...' WHERE email = 'admin@lexnotar.ro';"
```

---

## ⚠️ PITFALLS - Probleme Comune

### 1. i18n Loading Issues
**Simptom**: "i18n is not initialized"  
**Cauză**: useTranslation() apelat prea devreme  
**Fix**: Folosește HTTP backend + useSuspense: false

### 2. Router Context Errors
**Simptom**: "useNavigate must be in Router context"  
**Cauză**: Hook apelat înainte de BrowserRouter  
**Fix**: Mută hooks în componentă child după BrowserRouter

### 3. Token Mismatch
**Simptom**: Login reușit dar logout imediat  
**Cauză**: camelCase vs snake_case în response  
**Fix**: Verifică backend response format cu curl

### 4. Tailwind Errors
**Simptom**: "Cannot apply unknown utility class"  
**Cauză**: Tailwind v4 incompatibil cu @tailwind directives  
**Fix**: Folosește tailwindcss@^3

### 5. Codespaces Network Issues
**Simptom**: API calls fail cu 404  
**Cauză**: Port forwarding sau proxy config greșită  
**Fix**: Verifică vite.config.ts proxy + --host 0.0.0.0

### 6. Dark Mode Styling Missing
**Simptom**: Elemente rămân white în dark mode  
**Cauză**: Tailwind dark: classes lipsă  
**Fix**: Adaugă global styles în index.css

---

## 📝 Ce Urmează (TODO)

### Prioritate ÎNALTĂ

1. **Logo PNG Fix**
   - Status: Copiat în /public/ dar nu se încarcă
   - Alternatives:
     - Import ca modul: `import logo from '/public/lexnotar-logo.png'`
     - Inline SVG
     - Base64 encode
     - Move to /src/assets/

2. **Feature Testing**
   - [ ] File Preview Modal (PDF, images, video, audio)
   - [ ] Dark Mode Toggle (Sun/Moon icons)
   - [ ] Language Switcher (RO ↔ EN)
   - [ ] Keyboard Shortcuts (8 shortcuts + help modal)
   - [ ] Onboarding Wizard (5 steps)

3. **CRUD Operations Testing**
   - [ ] Cases (create, view, edit, delete)
   - [ ] Clients (add, search, update)
   - [ ] Documents (upload, preview, download)
   - [ ] Tasks (create, assign, complete)
   - [ ] Calendar (events, appointments)

### Prioritate MEDIE

4. **Permission System**
   - [ ] Test RoleGuard (Users page - ADMIN only)
   - [ ] Test Audit Logs (ADMIN, NOTAR only)
   - [ ] Create test users cu roluri diferite

5. **Mobile Responsiveness**
   - [ ] Test pe screen sizes diferite
   - [ ] Verifică sidebar collapse pe mobile
   - [ ] Test hamburger menu

6. **Error Handling**
   - [ ] Test cu backend oprit
   - [ ] Verifică error messages
   - [ ] Test token refresh flow

### Prioritate SCĂZUTĂ

7. **Performance Optimization**
   - [ ] React Query caching
   - [ ] Lazy loading routes
   - [ ] Bundle size analysis

8. **Accessibility**
   - [ ] Keyboard navigation
   - [ ] Screen reader compatibility
   - [ ] ARIA labels

9. **Documentation**
   - [ ] Inline code comments
   - [ ] Component documentation
   - [ ] API endpoint documentation

---

## 🔑 Credențiale și Accese

### Admin User
- **Email**: admin@lexnotar.ro
- **Parola**: LexNotar2025!
- **Rol**: ADMIN

### Database Access
```bash
docker exec -it lexnotar-postgres psql -U lexnotar -d lexnotar
```

### Service URLs (Codespaces)
- Frontend: https://[codespace-name]-5173.app.github.dev
- Backend: https://[codespace-name]-3000.app.github.dev
- Health: https://[codespace-name]-3000.app.github.dev/api/v1/health

---

## 📚 Resurse Utile

### Documentație
- [NestJS Docs](https://docs.nestjs.com/)
- [React Query](https://tanstack.com/query/latest)
- [i18next](https://www.i18next.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

### Comenzi Rapide
```bash
# Backend
cd /workspaces/LexNotar/backend
npm run start:dev          # Development
npm run build              # Build
npm run test               # Tests
npx prisma studio          # Database GUI
npx prisma generate        # Regenerate client

# Frontend
cd /workspaces/LexNotar/frontend
npm run dev                # Development
npm run build              # Build
npm run preview            # Preview build

# Database
docker-compose up -d       # Start services
docker-compose down        # Stop services
docker logs lexnotar-postgres  # View logs
```

---

## 🎨 Design System

### Culori Dark Mode
```
Background: gray-900
Cards: gray-800
Sidebar: gray-800
Inputs: gray-600 (normal), gray-500 (focus)
Borders: gray-500 (normal), indigo-400 (focus)
Text: white, gray-100
Placeholder: gray-300
Accents: indigo-600, indigo-500
```

### Layout Structure
```
┌─────────────────────────────────────┐
│  Sidebar (w-64, gray-800)           │
│  ┌─────────────────┐                │
│  │ Logo + Collapse │                │
│  ├─────────────────┤                │
│  │ Navigation      │   Main Content │
│  │ - Dashboard     │   ┌──────────┐ │
│  │ - Cases         │   │ Header   │ │
│  │ - Clients       │   ├──────────┤ │
│  │ - Documents     │   │          │ │
│  │ - Calendar      │   │ Content  │ │
│  │ - Tasks         │   │ (Outlet) │ │
│  │ - Reports       │   │          │ │
│  │ - Settings      │   │          │ │
│  │ - Users (admin) │   │          │ │
│  ├─────────────────┤   └──────────┘ │
│  │ User Profile    │                │
│  └─────────────────┘                │
└─────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### Autentificare
- [x] Login cu credențiale corecte
- [x] Token storage în localStorage
- [x] Session persistence după refresh
- [x] Protected routes redirect la login
- [ ] Logout functionality
- [ ] Token refresh flow

### UI/UX
- [x] Dark mode default
- [x] Dark mode login page
- [x] Sidebar navigation functional
- [x] Input fields dark styled
- [ ] Theme toggle works
- [ ] Language switcher works
- [ ] Responsive design mobile
- [ ] Keyboard shortcuts active

### Features
- [ ] File preview modal
- [ ] Onboarding wizard flow
- [ ] Document upload/download
- [ ] Case management CRUD
- [ ] Client management CRUD
- [ ] Task management
- [ ] Calendar events
- [ ] Reports generation

---

## 🔐 Security Notes

### Authentication
- JWT tokens cu expirare
- bcrypt hashing (cost 10)
- Refresh token rotation
- HTTP-only cookies (TODO pentru producție)

### Database
- Prepared statements (Prisma)
- Role-based access control (RBAC)
- Audit logs pentru acțiuni importante

### Frontend
- XSS protection (React auto-escape)
- CSRF tokens (TODO pentru producție)
- Input validation client + server

---

## 📞 Support & Debugging

### Logs
```bash
# Backend errors
tail -f /tmp/backend.log

# Frontend errors
tail -f /tmp/vite.log

# Database logs
docker logs -f lexnotar-postgres

# Browser console
F12 → Console tab
```

### Common Commands
```bash
# Restart backend
pkill -f "nest start" && cd /workspaces/LexNotar/backend && nohup npm run start:dev > /tmp/backend.log 2>&1 &

# Restart frontend
pkill -f "vite" && cd /workspaces/LexNotar/frontend && nohup npm run dev -- --host 0.0.0.0 > /tmp/vite.log 2>&1 &

# Clear localStorage (browser console)
localStorage.clear()

# Reset database
docker-compose down -v
docker-compose up -d
cd backend && npx prisma migrate reset
```

---

## ✅ Success Metrics

**Current Status**: 🟢 FUNCTIONAL

- ✅ Backend running no errors
- ✅ Frontend building no errors
- ✅ Database connected
- ✅ Authentication working
- ✅ Dark mode implemented
- ✅ Sidebar navigation working
- ✅ 6 major features implemented
- ⚠️ Logo PNG pending
- ⏳ Feature testing in progress

---

## 🎯 Next Session Goals

1. **Test toate cele 6 features implementate**
2. **Resolve logo PNG issue**
3. **Test CRUD operations (Cases, Clients, Documents)**
4. **Create additional test users cu roluri diferite**
5. **Mobile responsive testing**
6. **Performance optimization dacă e nevoie**

---

**Document creat**: 22 Noiembrie 2025  
**Ultima actualizare**: 22 Noiembrie 2025  
**Status**: Active Development  
**Versiune**: 1.0

---

## 🤖 Pentru Viitorul Copilot

Când preiei acest proiect:

1. **Citește întâi Issues #1-7** - Evită aceleași capcane
2. **Verifică process status**: `ps aux | grep -E "nest|vite"`
3. **Test health checks** înainte de orice modificare
4. **NICIODATĂ** nu folosi Tailwind v4
5. **ÎNTOTDEAUNA** verifică că hooks sunt în context-ul corect
6. **Backend returnează camelCase** nu snake_case
7. **Dark mode este default** - nu schimba asta
8. **i18n folosește HTTP backend** - nu import direct JSON
9. **Logo PNG nu funcționează** - acceptă text fallback
10. **Parola admin**: LexNotar2025! (resetează dacă e nevoie)

**Good luck!** 🚀
