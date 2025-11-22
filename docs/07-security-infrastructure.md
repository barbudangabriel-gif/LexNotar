# 7. Security & Infrastructure

[← Înapoi la Blueprint](../PRODUCT_BLUEPRINT.md) | [← Previous](./06-system-architecture.md) | [Next →](./08-implementation-roadmap.md)

---

## Obiectiv

Detalii suplimentare despre securitate, infrastructure-as-code, DevOps practices, compliance technical implementation.

---

## 7.1. Infrastructure as Code (IaC)

### 7.1.1. Terraform (Recommended)

**Manage AWS/Azure resources programmatic.**

**Example: AWS VPC + RDS Setup**

```hcl
# terraform/main.tf

provider "aws" {
  region = "eu-west-1"  # Frankfurt
}

# VPC
resource "aws_vpc" "lexnotar_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "lexnotar-vpc"
    Environment = var.environment
  }
}

# Private Subnet (pentru RDS)
resource "aws_subnet" "private_subnet_a" {
  vpc_id            = aws_vpc.lexnotar_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "eu-west-1a"

  tags = {
    Name = "lexnotar-private-subnet-a"
  }
}

resource "aws_subnet" "private_subnet_b" {
  vpc_id            = aws_vpc.lexnotar_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "eu-west-1b"

  tags = {
    Name = "lexnotar-private-subnet-b"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "lexnotar_db" {
  identifier           = "lexnotar-db-${var.environment}"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.large"
  allocated_storage    = 100
  storage_type         = "gp3"
  storage_encrypted    = true
  
  db_name  = "lexnotar"
  username = var.db_username
  password = var.db_password  # From AWS Secrets Manager
  
  multi_az               = true  # High availability
  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  db_subnet_group_name   = aws_db_subnet_group.lexnotar_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  
  skip_final_snapshot = false
  final_snapshot_identifier = "lexnotar-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  tags = {
    Name        = "lexnotar-db"
    Environment = var.environment
  }
}

# S3 Bucket pentru documente
resource "aws_s3_bucket" "lexnotar_documents" {
  bucket = "lexnotar-documents-${var.environment}"

  tags = {
    Name        = "lexnotar-documents"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "documents_versioning" {
  bucket = aws_s3_bucket.lexnotar_documents.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "documents_lifecycle" {
  bucket = aws_s3_bucket.lexnotar_documents.id

  rule {
    id     = "archive-old-documents"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}

# Outputs
output "rds_endpoint" {
  value = aws_db_instance.lexnotar_db.endpoint
}

output "s3_bucket_name" {
  value = aws_s3_bucket.lexnotar_documents.bucket
}
```

**Benefits:**
- Versioned infrastructure (Git)
- Reproducible (destroy + recreate identical environment)
- Multi-environment (staging, production) using variables

---

### 7.1.2. Docker & Docker Compose

**Containerization pentru consistent deployment.**

**Dockerfile (Backend - .NET)**

```dockerfile
# Dockerfile

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["LexNotar.API/LexNotar.API.csproj", "LexNotar.API/"]
COPY ["LexNotar.Core/LexNotar.Core.csproj", "LexNotar.Core/"]
RUN dotnet restore "LexNotar.API/LexNotar.API.csproj"

COPY . .
WORKDIR "/src/LexNotar.API"
RUN dotnet build "LexNotar.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "LexNotar.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "LexNotar.API.dll"]
```

**Docker Compose (Local Development)**

```yaml
# docker-compose.yml

version: '3.8'

services:
  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: lexnotar_dev
      POSTGRES_USER: lexnotar
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lexnotar"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: "Host=postgres;Port=5432;Database=lexnotar_dev;Username=lexnotar;Password=dev_password_123"
      REDIS_URL: "redis:6379"
      JWT_SECRET: "dev-secret-key-change-in-production"
      ASPNETCORE_ENVIRONMENT: Development
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/bin
      - /app/obj

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

**Usage:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

---

## 7.2. Secrets Management

### 7.2.1. AWS Secrets Manager

**Store sensitive data (DB passwords, API keys).**

**Create Secret:**
```bash
aws secretsmanager create-secret \
  --name lexnotar/prod/database \
  --description "PostgreSQL credentials" \
  --secret-string '{"username":"lexnotar","password":"SuperSecureP@ssw0rd123"}'
```

**Retrieve in Application (.NET):**
```csharp
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;

public class SecretsService
{
    private readonly IAmazonSecretsManager _client;

    public SecretsService(IAmazonSecretsManager client)
    {
        _client = client;
    }

    public async Task<string> GetSecretAsync(string secretName)
    {
        var request = new GetSecretValueRequest
        {
            SecretId = secretName
        };

        var response = await _client.GetSecretValueAsync(request);
        return response.SecretString;
    }
}

// Usage
var dbCredsJson = await secretsService.GetSecretAsync("lexnotar/prod/database");
var dbCreds = JsonSerializer.Deserialize<DbCredentials>(dbCredsJson);
```

---

### 7.2.2. Environment Variables

**Non-sensitive config (pentru local dev):**

```bash
# .env file (gitignored)
DATABASE_URL=postgresql://user:pass@localhost:5432/lexnotar_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-jwt-secret
ANAF_API_KEY=dev-anaf-key
CERTINOMIS_API_KEY=dev-certinomis-key
AWS_S3_BUCKET=lexnotar-documents-dev
AWS_REGION=eu-west-1
```

**Load in application:**
- .NET: `IConfiguration` (appsettings.json + env vars)
- Node.js: `dotenv` package

**Production:** Use AWS Secrets Manager sau Azure Key Vault (nu .env files).

---

## 7.3. SSL/TLS Certificate Management

### 7.3.1. AWS Certificate Manager (ACM)

**Free SSL certs pentru AWS resources.**

**Request Certificate:**
```bash
aws acm request-certificate \
  --domain-name lexnotar.ro \
  --subject-alternative-names "*.lexnotar.ro" "www.lexnotar.ro" \
  --validation-method DNS \
  --region eu-west-1
```

**DNS Validation:**
- ACM provides CNAME records
- Add to Route 53 (sau DNS provider)
- Auto-renew (ACM handles renewal)

**Attach to ALB:**
```hcl
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.lexnotar_alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.lexnotar_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lexnotar_tg.arn
  }
}
```

---

### 7.3.2. Let's Encrypt (On-Premise)

**Free SSL pentru self-hosted.**

**Certbot (automat renewal):**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d lexnotar.ro -d www.lexnotar.ro

# Auto-renewal (cron job added automatically)
sudo certbot renew --dry-run
```

**Nginx Config:**
```nginx
server {
    listen 443 ssl http2;
    server_name lexnotar.ro www.lexnotar.ro;

    ssl_certificate /etc/letsencrypt/live/lexnotar.ro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lexnotar.ro/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name lexnotar.ro www.lexnotar.ro;
    return 301 https://$server_name$request_uri;
}
```

---

## 7.4. Database Security

### 7.4.1. Encryption at Rest

**AWS RDS:**
- Enable în Terraform: `storage_encrypted = true`
- Uses AWS KMS keys (AES-256)
- Transparent (no app changes needed)

**PostgreSQL On-Premise:**
```bash
# pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

# Encrypt sensitive columns
CREATE TABLE persons (
    id UUID PRIMARY KEY,
    cnp VARCHAR(13),
    cnp_encrypted BYTEA  -- Encrypted CNP
);

# Insert encrypted
INSERT INTO persons (id, cnp_encrypted)
VALUES (gen_random_uuid(), pgp_sym_encrypt('1234567890123', 'encryption-key'));

# Query decrypted
SELECT id, pgp_sym_decrypt(cnp_encrypted, 'encryption-key') AS cnp
FROM persons;
```

**Recommendation:** Use RDS encryption (easier management).

---

### 7.4.2. Row-Level Security (RLS)

**Enforce office isolation la DB level.**

```sql
-- Enable RLS pe tabel
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Policy: User poate vedea doar case-uri din office-ul său
CREATE POLICY office_isolation_policy ON cases
  FOR ALL
  USING (office_id = current_setting('app.current_office_id')::uuid);

-- În aplicație, set context per request:
SET app.current_office_id = 'uuid-office-123';

-- Query (RLS aplică automat filter)
SELECT * FROM cases;  -- Returns only cases WHERE office_id = 'uuid-office-123'
```

**Benefits:**
- Imposibil ca developer să uite `WHERE office_id = ...` (DB enforces)
- Protection împotriva SQL injection care bypass app-level checks

---

### 7.4.3. Database User Permissions

**Principle of Least Privilege:**

```sql
-- Create app user (NOT superuser)
CREATE USER lexnotar_app WITH PASSWORD 'secure-password';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE lexnotar TO lexnotar_app;
GRANT USAGE ON SCHEMA public TO lexnotar_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lexnotar_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lexnotar_app;

-- Read-only user pentru reports
CREATE USER lexnotar_reports WITH PASSWORD 'another-password';
GRANT CONNECT ON DATABASE lexnotar TO lexnotar_reports;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lexnotar_reports;
```

**Application:**
- Migration tool (Flyway, Liquibase): Uses `postgres` superuser
- App runtime: Uses `lexnotar_app` (limited permissions)
- Analytics/BI: Uses `lexnotar_reports` (read-only)

---

## 7.5. API Security

### 7.5.1. Rate Limiting

**Prevent abuse (brute force, DDoS).**

**Redis-based (Express.js example):**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Global rate limit: 100 req/15min per IP
const limiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Prea multe cereri. Încercați din nou în 15 minute.',
});

app.use('/api/', limiter);

// Strict rate limit pentru login: 5 attempts/15min
const loginLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:login:' }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,  // Only count failed logins
  message: 'Prea multe încercări de login. Cont blocat 15 minute.',
});

app.post('/api/v1/auth/login', loginLimiter, authController.login);
```

**.NET Core (AspNetCoreRateLimit):**
```csharp
// Startup.cs
services.AddMemoryCache();
services.Configure<IpRateLimitOptions>(Configuration.GetSection("IpRateLimiting"));
services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
services.AddInMemoryRateLimiting();

// Middleware
app.UseIpRateLimiting();
```

**appsettings.json:**
```json
{
  "IpRateLimiting": {
    "EnableEndpointRateLimiting": true,
    "StackBlockedRequests": false,
    "RealIpHeader": "X-Forwarded-For",
    "GeneralRules": [
      {
        "Endpoint": "*",
        "Period": "15m",
        "Limit": 100
      },
      {
        "Endpoint": "*/api/v1/auth/login",
        "Period": "15m",
        "Limit": 5
      }
    ]
  }
}
```

---

### 7.5.2. Input Validation & Sanitization

**Prevent injection attacks.**

**Backend (.NET - FluentValidation):**
```csharp
public class CreateCaseValidator : AbstractValidator<CreateCaseRequest>
{
    public CreateCaseValidator()
    {
        RuleFor(x => x.CaseType)
            .NotEmpty()
            .IsInEnum();

        RuleFor(x => x.ObjectDescription)
            .NotEmpty()
            .MaximumLength(1000)
            .Must(BeValidText).WithMessage("Descriere conține caractere invalide");

        RuleFor(x => x.ContractValue)
            .GreaterThanOrEqualTo(0)
            .When(x => x.ContractValue.HasValue);
    }

    private bool BeValidText(string text)
    {
        // Block SQL keywords, script tags
        var forbidden = new[] { "<script", "DROP TABLE", "DELETE FROM", "--" };
        return !forbidden.Any(f => text.Contains(f, StringComparison.OrdinalIgnoreCase));
    }
}

// Controller
[HttpPost]
public async Task<IActionResult> CreateCase([FromBody] CreateCaseRequest request)
{
    var validator = new CreateCaseValidator();
    var result = await validator.ValidateAsync(request);
    
    if (!result.IsValid)
    {
        return BadRequest(result.Errors);
    }
    
    // Proceed...
}
```

**Frontend (Zod schema validation):**
```typescript
import { z } from 'zod';

const createCaseSchema = z.object({
  caseType: z.enum(['sale_purchase_real_estate', 'donation', 'power_of_attorney']),
  objectDescription: z.string().min(1).max(1000),
  contractValue: z.number().nonnegative().optional(),
});

// Usage
const result = createCaseSchema.safeParse(formData);
if (!result.success) {
  // Show errors
  console.error(result.error.flatten());
}
```

---

### 7.5.3. CORS Configuration

**Control which domains can call API.**

**.NET Core:**
```csharp
// Startup.cs
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins(
                "https://lexnotar.ro",
                "https://www.lexnotar.ro",
                "http://localhost:3000"  // Dev only
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Middleware
app.UseCors("AllowFrontend");
```

**Node.js (Express):**
```typescript
import cors from 'cors';

const corsOptions = {
  origin: ['https://lexnotar.ro', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

---

### 7.5.4. Security Headers

**Helmet.js (Node.js) sau Manual (.NET):**

```typescript
// Node.js
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // Adjust based on needs
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.lexnotar.ro"],
    },
  },
  hsts: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));
```

**.NET Core:**
```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Add("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    
    await next();
});
```

---

## 7.6. Logging & Monitoring

### 7.6.1. Structured Logging

**Serilog (.NET):**
```csharp
// Program.cs
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "LexNotar.API")
    .Enrich.WithProperty("Environment", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"))
    .WriteTo.Console()
    .WriteTo.File("logs/lexnotar-.log", rollingInterval: RollingInterval.Day)
    .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(elasticUrl))
    {
        IndexFormat = "lexnotar-logs-{0:yyyy.MM.dd}",
        AutoRegisterTemplate = true,
    })
    .CreateLogger();

builder.Host.UseSerilog();

// Usage în code
logger.LogInformation("Case {CaseId} created by user {UserId}", caseId, userId);
logger.LogWarning("Failed login attempt for user {Email} from IP {IpAddress}", email, ipAddress);
logger.LogError(ex, "Error processing document {DocumentId}", documentId);
```

**Winston (Node.js):**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lexnotar-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Usage
logger.info('Case created', { caseId, userId });
logger.warn('Failed login attempt', { email, ipAddress });
logger.error('Document processing error', { error, documentId });
```

---

### 7.6.2. Metrics & Dashboards

**Prometheus + Grafana:**

**Expose metrics (.NET - prometheus-net):**
```csharp
using Prometheus;

// Startup.cs
app.UseMetricServer();  // Expose /metrics endpoint
app.UseHttpMetrics();   // Collect HTTP metrics

// Custom metrics
public class MetricsService
{
    private static readonly Counter CasesCreated = Metrics
        .CreateCounter("lexnotar_cases_created_total", "Total cases created");
    
    private static readonly Histogram DocumentUploadDuration = Metrics
        .CreateHistogram("lexnotar_document_upload_duration_seconds", 
            "Document upload duration in seconds");

    public void RecordCaseCreated() => CasesCreated.Inc();
    
    public IDisposable MeasureDocumentUpload() => DocumentUploadDuration.NewTimer();
}
```

**Prometheus scrape config:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'lexnotar-api'
    static_configs:
      - targets: ['api:5000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

**Grafana Dashboard:**
- Request rate (req/s)
- Response time (p50, p95, p99)
- Error rate (%)
- Database query time
- Active users (concurrent sessions)
- Case creation rate (per day)

---

### 7.6.3. Alerting

**Prometheus Alertmanager:**

```yaml
# alertmanager.yml
groups:
  - name: lexnotar_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% for the last 5 minutes"

      - alert: DatabaseConnectionPoolHigh
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool usage high"
          
      - alert: DiskSpaceRunningOut
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Disk space < 10%"
```

**Notification channels:**
- E-mail: team@lexnotar.ro
- Slack: #alerts channel
- PagerDuty: Pentru critical alerts (24/7)

---

## 7.7. Compliance Technical Implementation

### 7.7.1. GDPR Data Subject Rights

**Automated Data Export (Art. 15):**

```csharp
public class GdprService
{
    public async Task<byte[]> ExportClientDataAsync(Guid clientId)
    {
        // Collect all data about client
        var person = await _context.Persons.FindAsync(clientId);
        var cases = await _context.CaseParties
            .Where(cp => cp.PartyId == clientId)
            .Include(cp => cp.Case)
            .ToListAsync();
        var documents = await _context.Documents
            .Where(d => cases.Select(c => c.CaseId).Contains(d.CaseId))
            .ToListAsync();
        var invoices = await _context.Invoices
            .Where(i => i.ClientId == clientId)
            .ToListAsync();

        // Generate PDF report
        var pdfData = GenerateGdprExportPdf(person, cases, documents, invoices);
        
        // Log action
        await _auditService.LogAsync(new AuditLogEntry
        {
            ActionType = "client.gdpr_access_request",
            EntityType = "Person",
            EntityId = clientId,
            UserId = _currentUser.Id,
            Timestamp = DateTime.UtcNow,
        });

        return pdfData;
    }
}
```

---

### 7.7.2. Data Anonymization (după 30 ani)

**Scheduled Job:**

```csharp
public class DataAnonymizationJob : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private Timer _timer;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        // Run daily at 03:00
        _timer = new Timer(AnonymizeOldData, null, 
            TimeSpan.FromHours(3), TimeSpan.FromDays(1));
        return Task.CompletedTask;
    }

    private async void AnonymizeOldData(object state)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        var cutoffDate = DateTime.UtcNow.AddYears(-30);
        
        var oldCases = await context.Cases
            .Where(c => c.ClosedAt < cutoffDate && !c.IsAnonymized)
            .Include(c => c.CaseParties)
            .ThenInclude(cp => cp.Party)
            .ToListAsync();

        foreach (var case in oldCases)
        {
            foreach (var party in case.CaseParties)
            {
                if (party.PartyType == "person")
                {
                    var person = party.Party as Person;
                    // Anonymize
                    person.Cnp = HashCnp(person.Cnp);
                    person.FirstName = "Persoană";
                    person.LastName = $"Fizică {party.Id.ToString().Substring(0, 8)}";
                    person.Address = "Municipiu București";
                    person.Phone = null;
                    person.Email = null;
                }
            }
            
            case.IsAnonymized = true;
        }

        await context.SaveChangesAsync();
        
        _logger.LogInformation("Anonymized {Count} cases older than 30 years", oldCases.Count);
    }
    
    private string HashCnp(string cnp) => 
        Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(cnp)));
}
```

---

### 7.7.3. Audit Log Immutability

**Database trigger (PostgreSQL):**

```sql
-- Prevent UPDATE/DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modifications()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. Cannot modify or delete.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_immutable_trigger
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modifications();
```

**Application-level protection:**
```csharp
// Repository only allows INSERT
public class AuditLogRepository
{
    public async Task<AuditLog> CreateAsync(AuditLog log)
    {
        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
        return log;
    }
    
    // No Update or Delete methods exposed
}
```

---

## 7.8. Penetration Testing & Vulnerability Management

### 7.8.1. Automated Security Scanning

**OWASP ZAP (CI/CD integration):**

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly, Sunday 02:00
  workflow_dispatch:

jobs:
  zap-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Run OWASP ZAP Full Scan
        uses: zaproxy/action-full-scan@v0.4.0
        with:
          target: 'https://staging.lexnotar.ro'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
      
      - name: Upload ZAP Report
        uses: actions/upload-artifact@v3
        with:
          name: zap-report
          path: report_html.html
```

---

### 7.8.2. Dependency Vulnerability Scanning

**Dependabot (GitHub):**

`.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "nuget"
    directory: "/backend"
    schedule:
      interval: "weekly"
```

**Snyk (alternative):**
```bash
# Install Snyk CLI
npm install -g snyk

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor
```

---

### 7.8.3. Annual Penetration Test

**Process:**
1. **Engage certified firm** (Q4 annually)
2. **Scope:** Web app, API, infrastructure
3. **Duration:** 2-3 weeks
4. **Deliverable:** Report cu vulnerabilities (ranked by severity)
5. **Remediation:** Fix critical în 48h, high în 7 days, medium în 30 days
6. **Re-test:** Firm re-tests fixes (included în contract)

**Cost estimate:** €5,000 - €15,000 per test (depending on scope).

---

**[Next: Implementation Roadmap →](./08-implementation-roadmap.md)**
