# LexNotar

**Tagline:** „Acte corecte. Flux eficient."

## Despre Proiect

LexNotar este o platformă B2B SaaS (cu opțiune on-premise) pentru managementul complet al birourilor notariale din România și UE, cu focus pe notariatul civil law. Sistemul devine "sistemul nervos central" al biroului notarial: dosare, acte, clienți, termene, facturare, conformitate - toate într-un singur loc.

### Țintă Principală
- Birouri notariale din România (compatibil cu extindere în UE)
- De la practician solo (1 notar + 1 asistent) până la birouri mari (10+ notari, 20+ asistenți)

### Diferențierea LexNotar
Spre deosebire de CRM-uri generice sau sisteme simple de programări, LexNotar este construit în jurul **dosarului notarial** ca entitate centrală, cu:
- Lifecycle complet (Draft → Signed → Arhivat)
- Părți cu roluri specifice, obiecte juridice, checklist-uri configurabile
- Conformitate GDPR și eIDAS by-design
- Repertoriu notarial obligatoriu conform Legii 36/1995
- Integrări cu QES (semnătură electronică calificată)

---

## Documentație

📘 **[PRODUCT_BLUEPRINT.md](./PRODUCT_BLUEPRINT.md)** - Blueprint complet de produs (arhitectură, feature map, roadmap)

---

## Status Proiect

**Fază curentă:** Product Design & Architecture (Blueprint completat)

**Roadmap planificat:**
- **MVP** (3-4 luni): Core case management, CRM basic, document generation, repertoriu notarial
- **V1** (+2-3 luni): Integrare QES, calendar multi-user, billing automatizat, rapoarte
- **V2+** (+4-6 luni): Portal client, integrări ANAF/ONRC, remote notarization (dacă legislația permite), analytics avansat

---

## Tech Stack (Planificat)

**Frontend:** React/Vue + TypeScript  
**Backend:** .NET Core / Node.js + TypeScript  
**Database:** PostgreSQL  
**Storage:** AWS S3 / Azure Blob / MinIO (on-prem)  
**Cache:** Redis  
**Deployment:** Docker + Kubernetes (SaaS) / Installer Windows/Linux (on-prem)

---

## Conformitate & Securitate

✅ **GDPR compliant** - Data residency UE, DPIA, drept acces/ștergere  
✅ **eIDAS** - Integrare QES cu QTSP-uri aprobate EU  
✅ **Legislație RO** - Repertoriu notarial, arhivare 30 ani, calcul tarife conform OUG 119/2022  
✅ **Security by design** - RBAC, audit trail imutabil, TLS 1.3, encryption at rest

---

## Contact

**Project Owner:** [barbudangabriel-gif](https://github.com/barbudangabriel-gif)  
**Repository:** [LexNotar](https://github.com/barbudangabriel-gif/LexNotar)

---

*Blueprint creat: Noiembrie 2025*
