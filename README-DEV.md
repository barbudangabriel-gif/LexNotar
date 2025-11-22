# LexNotar - Developer Guide 🚀

> Complete development documentation for LexNotar notary management system

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [Development Workflow](#development-workflow)
6. [API Documentation](#api-documentation)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Git**

### Installation Steps

1. **Clone & Setup**
```bash
git clone https://github.com/barbudangabriel-gif/LexNotar.git
cd LexNotar
```

2. **Backend Setup**
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

3. **Database Setup**
```bash
# Create database
createdb lexnotar

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed initial data
npx prisma db seed
```

4. **Frontend Setup**
```bash
cd ../frontend
npm install

# Copy environment file
cp .env.example .env

# Edit .env
nano .env
```

5. **Start Development**

Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Default Login
- Email: `admin@lexnotar.ro`
- Password: `admin123`

---

## 🏗️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 11.x | Backend framework |
| Prisma ORM | 6.x | Database ORM |
| PostgreSQL | 14+ | Database |
| Socket.IO | 4.x | WebSocket |
| JWT | 9.x | Authentication |
| Nodemailer | 6.x | Email |
| PDFKit | 0.x | PDF generation |
| Handlebars | 4.x | Templates |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tool |
| TanStack Query | 5.x | Data fetching |
| React Router | 6.x | Routing |
| Tailwind CSS | 3.x | Styling |
| Recharts | 2.x | Charts |
| Socket.IO Client | 4.x | Real-time |
| XLSX | 0.x | Excel export |

---

## 📂 Project Structure

```
LexNotar/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema definition
│   │   ├── migrations/            # Database migrations
│   │   └── seed.ts               # Seed data script
│   ├── src/
│   │   ├── auth/                 # Authentication (JWT, login, register)
│   │   ├── users/                # User CRUD, management
│   │   ├── offices/              # Office management
│   │   ├── cases/                # Case management (core)
│   │   ├── clients/              # Client CRM
│   │   ├── documents/            # Document upload, storage
│   │   ├── tasks/                # Task & workflow
│   │   ├── mail/                 # Email service + templates
│   │   ├── templates/            # PDF generation service
│   │   ├── notifications/        # WebSocket gateway
│   │   ├── audit-logs/           # Audit trail
│   │   ├── document-versions/    # Version control
│   │   ├── common/               # Guards, decorators, filters
│   │   │   ├── guards/           # JWT, Roles guards
│   │   │   ├── decorators/       # @Roles, @CurrentUser
│   │   │   └── filters/          # Exception filters
│   │   ├── prisma/               # Prisma service
│   │   ├── app.module.ts         # Root module
│   │   └── main.ts               # Bootstrap
│   ├── test/                     # E2E tests
│   ├── .env.example              # Environment template
│   ├── nest-cli.json             # NestJS config
│   ├── tsconfig.json             # TypeScript config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/                # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CasesListPage.tsx
│   │   │   ├── CaseDetailPage.tsx
│   │   │   ├── ClientsListPage.tsx
│   │   │   ├── TasksListPage.tsx
│   │   │   ├── DocumentsListPage.tsx
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── TemplatesPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── AuditLogsPage.tsx
│   │   │   ├── DocumentVersionsPage.tsx
│   │   │   └── UsersListPage.tsx
│   │   ├── components/           # Reusable components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── RoleGuard.tsx
│   │   │   ├── GlobalSearch.tsx
│   │   │   ├── MobileMenu.tsx
│   │   │   └── NotificationBell.tsx
│   │   ├── context/              # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── NotificationsContext.tsx
│   │   ├── services/             # API services
│   │   │   └── api.ts
│   │   ├── App.tsx               # App component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── public/                   # Static assets
│   ├── .env.example              # Environment template
│   ├── vite.config.ts            # Vite config
│   ├── tsconfig.json             # TypeScript config
│   └── package.json
│
├── docs/                          # Documentation
│   ├── 01-vision-and-positioning.md
│   ├── 02-user-personas.md
│   ├── 03-functional-modules-overview.md
│   ├── 04-non-functional-requirements.md
│   ├── 05-data-model.md
│   ├── 06-system-architecture.md
│   ├── 07-security-infrastructure.md
│   └── 08-implementation-roadmap.md
│
├── .gitignore
├── README.md                      # Main README
├── README-DEV.md                  # This file
└── PRODUCT_BLUEPRINT.md           # Product blueprint

```

---

## 🔧 Configuration

### Backend .env
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lexnotar?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-minimum-32-characters"

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SMTP_FROM="LexNotar <noreply@lexnotar.ro>"

# Server
PORT=3000
NODE_ENV=development
```

### Frontend .env
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Email Configuration (Gmail)
1. Enable 2FA on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `SMTP_PASS`

---

## 🛠️ Development Workflow

### Database Commands
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (CAREFUL!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npx prisma db seed
```

### Backend Commands
```bash
# Development mode (watch)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Linting
npm run lint

# Format code
npm run format

# Generate module
nest g module module-name
nest g controller module-name
nest g service module-name
```

### Frontend Commands
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Type check
npm run type-check
```

---

## 📡 API Documentation

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ASISTENT",
  "officeId": "office-uuid"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": { ... }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

### Cases

#### List Cases
```http
GET /cases
Authorization: Bearer {token}

Query params:
- status: DRAFT | IN_PROGRESS | COMPLETED
- caseType: VANZARE_CUMPARARE | DONATIE | ...
- search: string
```

#### Create Case
```http
POST /cases
Authorization: Bearer {token}
Content-Type: application/json

{
  "caseNumber": "2024/001",
  "title": "Vanzare apartament",
  "caseType": "VANZARE_CUMPARARE",
  "status": "DRAFT",
  "startDate": "2024-01-01T00:00:00Z",
  "clientIds": ["client-uuid"],
  "estimatedValue": 150000
}
```

### Documents

#### Upload Document
```http
POST /documents
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
caseId: "case-uuid"
title: "Contract"
type: "CONTRACT"
```

#### Get Document Versions
```http
GET /documents/:id/versions
Authorization: Bearer {token}
```

#### Create New Version
```http
POST /documents/:id/versions
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
changesSummary: "Updated terms"
```

### Templates

#### List Templates
```http
GET /templates
Authorization: Bearer {token}
```

#### Generate PDF
```http
POST /templates/:id/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "sellerName": "Ion Popescu",
  "buyerName": "Maria Ionescu",
  // ... template-specific fields
}
```

### Real-time Notifications (WebSocket)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'jwt-token' }
});

socket.on('notification', (notification) => {
  console.log('Received:', notification);
});
```

---

## 🧪 Testing

### Backend Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend Testing

```bash
# Unit tests (Vitest)
npm run test

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

### Manual Testing

1. **Login Flow**
   - Register new user
   - Login with credentials
   - Test JWT refresh

2. **Case Management**
   - Create case
   - Add documents
   - Assign tasks
   - Update status

3. **Real-time Features**
   - Open 2 browser windows
   - Create task in window 1
   - Verify notification in window 2

4. **Document Versioning**
   - Upload document
   - Create new version
   - Revert to previous version

---

## 🚢 Deployment

### Docker Deployment

1. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: lexnotar
      POSTGRES_USER: lexnotar
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://lexnotar:secure_password@postgres:5432/lexnotar
      JWT_SECRET: your-production-secret
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    environment:
      VITE_API_BASE_URL: http://backend:3000
    ports:
      - "80:80"

volumes:
  postgres_data:
```

2. **Build & Run**
```bash
docker-compose up -d
```

### Production Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/TLS
- [ ] Set up database backups
- [ ] Configure email service
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure rate limiting
- [ ] Set up CDN for static assets
- [ ] Enable compression (gzip/brotli)
- [ ] Set proper environment variables
- [ ] Configure reverse proxy (nginx)

---

## 🔒 Security

### Authentication Flow
1. User logs in with email/password
2. Backend validates credentials
3. Returns JWT access token (15min) + refresh token (7d)
4. Frontend stores tokens in localStorage
5. All API requests include `Authorization: Bearer {token}`
6. When access token expires, use refresh token to get new one

### Role-Based Access Control
```typescript
// Backend guard
@Roles('ADMIN', 'NOTAR')
@Get('sensitive-data')
getSensitiveData() { ... }

// Frontend guard
<RoleGuard allowedRoles={['ADMIN']}>
  <AdminPanel />
</RoleGuard>
```

### Audit Logging
All important actions are logged automatically:
- User login/logout
- Case creation/update/deletion
- Document upload/download
- Task assignments
- Settings changes

---

## 📊 Performance

### Backend Optimizations
- Database indexes (configured in Prisma schema)
- Connection pooling (Prisma default)
- Query optimization with `include` and `select`
- Pagination for large datasets

### Frontend Optimizations
- Code splitting (Vite automatic)
- Lazy loading routes
- TanStack Query caching
- Debounced search inputs
- Optimistic updates

---

## 🐛 Debugging

### Backend Debugging (VS Code)
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug NestJS",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "start:debug"],
  "console": "integratedTerminal",
  "restart": true
}
```

### Frontend Debugging
- React DevTools browser extension
- TanStack Query DevTools (built-in)
- Network tab for API calls
- Console logs

### Common Issues

**Database connection failed**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check firewall settings

**CORS errors**
- Add frontend URL to backend CORS whitelist
- Check `main.ts` CORS configuration

**WebSocket not connecting**
- Verify Socket.IO versions match
- Check firewall allows WebSocket connections
- Verify JWT token is valid

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Socket.IO Documentation](https://socket.io/docs/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Create Pull Request

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/barbudangabriel-gif/LexNotar/issues)
- **Email**: support@lexnotar.ro
- **Documentation**: Check `/docs` folder

---

**Happy Coding! 🎉**
