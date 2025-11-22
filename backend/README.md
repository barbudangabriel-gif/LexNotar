# LexNotar Backend API

Backend API pentru platforma LexNotar - Sistem de Management pentru Birouri Notariale.

## 🚀 Tech Stack

- **Framework:** NestJS 10 (TypeScript)
- **Database:** PostgreSQL 16
- **ORM:** Prisma 6
- **Authentication:** JWT (Access + Refresh tokens)
- **Authorization:** RBAC (Role-Based Access Control)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 16
- npm sau yarn

## 🛠️ Setup

### 1. Instalare dependencies

```bash
npm install
```

### 2. Configurare environment variables

Copiază `.env.example` în `.env` și configurează:

```bash
cp .env.example .env
```

**Variabile importante:**
- `DATABASE_URL` - Connection string PostgreSQL
- `JWT_SECRET` - Secret pentru access tokens
- `JWT_REFRESH_SECRET` - Secret pentru refresh tokens
- `CORS_ORIGIN` - Frontend URL (http://localhost:5173)

### 3. Setup Database

#### Creează baza de date:

```bash
createdb lexnotar
# sau folosind psql:
psql -U postgres -c "CREATE DATABASE lexnotar;"
```

#### Rulează migrațiile Prisma:

```bash
npm run prisma:migrate
```

#### Seed cu date inițiale:

```bash
npm run prisma:seed
```

**Credentials default după seed:**
- **Admin:** admin@lexnotar.ro / admin123
- **Notar:** notar@lexnotar.ro / notar123  
- **Asistent:** asistent@lexnotar.ro / asistent123

### 4. Generează Prisma Client

```bash
npm run prisma:generate
```

## 🏃 Running the app

### Development mode (cu hot-reload)

```bash
npm run start:dev
```

API va fi disponibil la: `http://localhost:3000/api/v1`

### Production mode

```bash
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Health Check
- `GET /api/v1/health` - Status API

### Authentication
- `POST /api/v1/auth/register` - Înregistrare user nou
- `POST /api/v1/auth/login` - Autentificare
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout (invalidează refresh token)
- `GET /api/v1/auth/me` - Profil user curent (necesită auth)

### Users
- `GET /api/v1/users` - Lista utilizatori (Admin/Notar only)

### Offices  
- `GET /api/v1/offices` - Lista birouri active
- `GET /api/v1/offices/:id` - Detalii birou
- `POST /api/v1/offices` - Creare birou nou (Admin only)

## 🔐 Authorization Roles

- **ADMIN** - Acces complet la sistem
- **NOTAR** - Gestionare cazuri, documente, semnături
- **ASISTENT** - Operațiuni limitate, asistență notar
- **CONTABIL** - Gestiune facturare și plăți

## 🗄️ Database Schema

Schema include:
- **Users & Offices** - Utilizatori și birouri notariale
- **Clients** - Persoane fizice și juridice
- **Cases** - Dosare notariale (vânzare-cumpărare, succesiune, etc.)
- **Documents** - Acte notariale și documente anexate
- **Signatures** - Semnături electronice (QES)
- **Tasks** - Task management pentru dosare
- **AuditLog** - Audit trail pentru compliance

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Prisma Studio

Pentru a vizualiza și edita datele din baza de date:

```bash
npm run prisma:studio
```

Acces la: `http://localhost:5555`

## 🐳 Docker Support

Coming soon...

## 📚 Documentation

- [Prisma Schema](./prisma/schema.prisma)
- [Product Blueprint](../PRODUCT_BLUEPRINT.md)
- [API Documentation](./docs/api.md) _(coming soon)_

## 🔧 Useful Commands

```bash
# Format code
npm run format

# Lint code
npm run lint

# Create new Prisma migration
npm run prisma:migrate

# Reset database (⚠️ CAUTION: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npm run prisma:generate
```

## 📝 License

Proprietary - LexNotar Team
