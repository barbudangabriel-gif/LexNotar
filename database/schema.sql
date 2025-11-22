-- =====================================================
-- LexNotar - PostgreSQL Database Schema
-- Version: 1.0.0
-- PostgreSQL: 16+
-- Date: 2025-11-21
-- =====================================================
-- 
-- Design Principles:
-- - Surrogate keys (BIGSERIAL PRIMARY KEY)
-- - Timestamps on all tables (created_at, updated_at)
-- - NOT NULL where mandatory
-- - Foreign keys with ON DELETE RESTRICT for legal data
-- - Files stored externally (only metadata in DB)
-- - Multi-office support via office_id
-- - JSONB for flexible/optional data
-- =====================================================

-- =====================================================
-- SECTION 1: ENUMS & TYPES
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'NOTARY',
    'ASSISTANT',
    'ACCOUNTANT',
    'CLIENT'
);

-- Client types
CREATE TYPE client_type AS ENUM (
    'PERSON',
    'COMPANY'
);

-- Case status
CREATE TYPE case_status AS ENUM (
    'DRAFT',
    'IN_PROGRESS',
    'READY_TO_SIGN',
    'SIGNED',
    'ARCHIVED',
    'REJECTED'
);

-- Case party roles
CREATE TYPE party_role AS ENUM (
    'SELLER',
    'BUYER',
    'DONOR',
    'DONEE',
    'HEIR',
    'TESTATOR',
    'BENEFICIARY',
    'PROXY_GRANTOR',
    'PROXY_HOLDER',
    'CREDITOR',
    'DEBTOR',
    'WITNESS',
    'OTHER'
);

-- Object types in cases
CREATE TYPE object_type AS ENUM (
    'REAL_ESTATE',
    'VEHICLE',
    'MOVABLE',
    'BANK_ACCOUNT',
    'INTELLECTUAL_PROPERTY',
    'DEBT',
    'OTHER'
);

-- Document types
CREATE TYPE document_type AS ENUM (
    'UPLOADED',
    'GENERATED'
);

-- Document category
CREATE TYPE document_category AS ENUM (
    'DRAFT_ACT',
    'FINAL_ACT',
    'MINUTE',
    'CERTIFIED_COPY',
    'SUPPORTING_DOC',
    'ID_DOCUMENT',
    'LAND_REGISTRY',
    'FISCAL_CERTIFICATE',
    'POWER_OF_ATTORNEY',
    'DEATH_CERTIFICATE',
    'MARRIAGE_CERTIFICATE',
    'BIRTH_CERTIFICATE',
    'CONTRACT',
    'INVOICE',
    'OTHER'
);

-- Document status
CREATE TYPE document_status AS ENUM (
    'DRAFT',
    'REVIEW',
    'FINAL',
    'SIGNED',
    'ARCHIVED'
);

-- Template engine
CREATE TYPE template_engine AS ENUM (
    'DOCX',
    'HTML',
    'PDF'
);

-- Task status
CREATE TYPE task_status AS ENUM (
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED'
);

-- Invoice status
CREATE TYPE invoice_status AS ENUM (
    'DRAFT',
    'ISSUED',
    'PARTIALLY_PAID',
    'PAID',
    'CANCELLED',
    'OVERDUE'
);

-- Payment method
CREATE TYPE payment_method AS ENUM (
    'CASH',
    'CARD',
    'BANK_TRANSFER',
    'OTHER'
);

-- Integration types
CREATE TYPE integration_type AS ENUM (
    'EMAIL',
    'SMS',
    'E_SIGN',
    'PAYMENT',
    'ANAF',
    'ONRC',
    'RAR',
    'ANCPI',
    'OTHER'
);

-- Signature status
CREATE TYPE signature_status AS ENUM (
    'PENDING',
    'SIGNED',
    'REJECTED',
    'EXPIRED'
);

-- Repertory entry type
CREATE TYPE repertory_act_type AS ENUM (
    'SALE_PURCHASE',
    'DONATION',
    'SUCCESSION',
    'POWER_OF_ATTORNEY',
    'MORTGAGE',
    'MARRIAGE_CONTRACT',
    'WILL',
    'PARTITION',
    'OTHER'
);

-- =====================================================
-- SECTION 2: OFFICES & USERS
-- =====================================================

CREATE TABLE offices (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'RO' NOT NULL,
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    tax_id VARCHAR(50), -- CUI pentru birou
    registration_no VARCHAR(100), -- Nr. inregistrare Camera Notarilor
    settings JSONB DEFAULT '{}', -- Custom settings per office
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT offices_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_offices_is_active ON offices(is_active);

-- Users (notaries, assistants, accountants, admins)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(50),
    title VARCHAR(100), -- "Notar public", "Asistent notar"
    license_number VARCHAR(100), -- Nr. licenta notar (dacă aplicabil)
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login_at TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT false NOT NULL,
    preferences JSONB DEFAULT '{}', -- UI preferences, notifications, etc.
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_office_id ON users(office_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- SECTION 3: CLIENTS
-- =====================================================

CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    type client_type NOT NULL,
    
    -- Person fields (when type = PERSON)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    cnp VARCHAR(13), -- Cod Numeric Personal (13 digits)
    birth_date DATE,
    birth_place VARCHAR(255),
    
    -- Company fields (when type = COMPANY)
    company_name VARCHAR(255),
    cui VARCHAR(20), -- Cod Unic Înregistrare (max 10 digits but can have RO prefix)
    registration_no VARCHAR(50), -- Nr. Registrul Comerțului (ex: J40/1234/2020)
    
    -- Common fields
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'RO',
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- Metadata
    notes TEXT,
    flags JSONB DEFAULT '{}', -- {"high_risk": true, "vip": true, "kyc_verified": true}
    metadata JSONB DEFAULT '{}', -- Extra custom data
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT clients_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT clients_cnp_check CHECK (type != 'PERSON' OR (cnp IS NOT NULL AND LENGTH(cnp) = 13)),
    CONSTRAINT clients_cui_check CHECK (type != 'COMPANY' OR cui IS NOT NULL),
    CONSTRAINT clients_name_check CHECK (
        (type = 'PERSON' AND first_name IS NOT NULL AND last_name IS NOT NULL) OR
        (type = 'COMPANY' AND company_name IS NOT NULL)
    )
);

-- Unique constraints: One CNP per office, one CUI per office
CREATE UNIQUE INDEX idx_clients_office_cnp ON clients(office_id, cnp) WHERE cnp IS NOT NULL;
CREATE UNIQUE INDEX idx_clients_office_cui ON clients(office_id, cui) WHERE cui IS NOT NULL;

-- Search indexes
CREATE INDEX idx_clients_office_id ON clients(office_id);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_last_name ON clients(last_name) WHERE type = 'PERSON';
CREATE INDEX idx_clients_company_name ON clients(company_name) WHERE type = 'COMPANY';
CREATE INDEX idx_clients_email ON clients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_clients_is_active ON clients(is_active);

-- Full-text search on names
CREATE INDEX idx_clients_person_fulltext ON clients 
    USING gin(to_tsvector('romanian', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')))
    WHERE type = 'PERSON';
CREATE INDEX idx_clients_company_fulltext ON clients 
    USING gin(to_tsvector('romanian', COALESCE(company_name, '')))
    WHERE type = 'COMPANY';

-- =====================================================
-- SECTION 4: ACT TYPES & TEMPLATES
-- =====================================================

CREATE TABLE act_types (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT REFERENCES offices(id) ON DELETE RESTRICT, -- NULL = global/system-wide
    code VARCHAR(50) NOT NULL, -- 'SALE_PURCHASE', 'DONATION', 'SUCCESSION', etc.
    name VARCHAR(255) NOT NULL,
    name_ro VARCHAR(255), -- Romanian translation
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    metadata JSONB DEFAULT '{}', -- Extra config per act type
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT act_types_office_code_unique UNIQUE (office_id, code)
);

CREATE INDEX idx_act_types_office_id ON act_types(office_id);
CREATE INDEX idx_act_types_is_active ON act_types(is_active);

-- Checklist items template (per act type)
CREATE TABLE act_checklist_items (
    id BIGSERIAL PRIMARY KEY,
    act_type_id BIGINT NOT NULL REFERENCES act_types(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL, -- "Seller ID", "Land registry extract", etc.
    description TEXT,
    sort_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_act_checklist_items_act_type_id ON act_checklist_items(act_type_id);

-- Document templates
CREATE TABLE templates (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT REFERENCES offices(id) ON DELETE RESTRICT, -- NULL = global
    act_type_id BIGINT REFERENCES act_types(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    engine template_engine NOT NULL DEFAULT 'DOCX',
    content TEXT, -- Template markup (DOCX base64, HTML, etc.)
    variables JSONB DEFAULT '[]', -- List of {{variable}} names expected
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_templates_office_id ON templates(office_id);
CREATE INDEX idx_templates_act_type_id ON templates(act_type_id);
CREATE INDEX idx_templates_is_active ON templates(is_active);

-- =====================================================
-- SECTION 5: CASES (Notarial Files / Dosare)
-- =====================================================

CREATE TABLE cases (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    act_type_id BIGINT REFERENCES act_types(id) ON DELETE RESTRICT,
    
    case_code VARCHAR(50) NOT NULL, -- Unique per office (e.g. "2025/123")
    status case_status DEFAULT 'DRAFT' NOT NULL,
    
    subject_matter TEXT, -- Brief description of the case
    
    -- Primary client (usually the one who initiated the case)
    main_client_id BIGINT REFERENCES clients(id) ON DELETE RESTRICT,
    
    -- Assigned notary
    notary_id BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Dates
    opened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    signed_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    
    -- Financial
    estimated_value NUMERIC(15, 2), -- Estimated transaction value
    currency VARCHAR(3) DEFAULT 'RON',
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}', -- Custom fields
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT cases_office_case_code_unique UNIQUE (office_id, case_code)
);

CREATE INDEX idx_cases_office_id ON cases(office_id);
CREATE INDEX idx_cases_case_code ON cases(case_code);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_main_client_id ON cases(main_client_id);
CREATE INDEX idx_cases_notary_id ON cases(notary_id);
CREATE INDEX idx_cases_act_type_id ON cases(act_type_id);
CREATE INDEX idx_cases_opened_at ON cases(opened_at);

-- Full-text search on subject_matter
CREATE INDEX idx_cases_subject_fulltext ON cases 
    USING gin(to_tsvector('romanian', COALESCE(subject_matter, '')));

-- Parties in a case
CREATE TABLE case_parties (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    role party_role NOT NULL,
    
    -- Optional: If party represented by another (Power of Attorney)
    represented_by_client_id BIGINT REFERENCES clients(id) ON DELETE RESTRICT,
    
    extra_info JSONB DEFAULT '{}', -- Additional metadata per party
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT case_parties_unique UNIQUE (case_id, client_id, role)
);

CREATE INDEX idx_case_parties_case_id ON case_parties(case_id);
CREATE INDEX idx_case_parties_client_id ON case_parties(client_id);
CREATE INDEX idx_case_parties_role ON case_parties(role);

-- Objects/assets in a case (real estate, vehicles, etc.)
CREATE TABLE case_objects (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    type object_type NOT NULL,
    
    description TEXT NOT NULL,
    
    -- Real estate specific
    address TEXT,
    city VARCHAR(100),
    cadastral_no VARCHAR(100), -- Nr. cadastral
    land_book_no VARCHAR(100), -- Nr. Carte Funciară
    area_sqm NUMERIC(12, 2), -- Suprafață m²
    
    -- Vehicle specific
    vin VARCHAR(17), -- Vehicle Identification Number
    license_plate VARCHAR(20),
    make VARCHAR(100), -- Marcă
    model VARCHAR(100),
    year INT,
    
    -- Bank account specific
    iban VARCHAR(34),
    bank_name VARCHAR(255),
    
    -- Financial
    value_amount NUMERIC(15, 2),
    value_currency VARCHAR(3) DEFAULT 'RON',
    evaluation_date DATE,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_case_objects_case_id ON case_objects(case_id);
CREATE INDEX idx_case_objects_type ON case_objects(type);
CREATE INDEX idx_case_objects_cadastral_no ON case_objects(cadastral_no) WHERE cadastral_no IS NOT NULL;
CREATE INDEX idx_case_objects_land_book_no ON case_objects(land_book_no) WHERE land_book_no IS NOT NULL;
CREATE INDEX idx_case_objects_vin ON case_objects(vin) WHERE vin IS NOT NULL;

-- Case checklist (instance of act_checklist_items for a specific case)
CREATE TABLE case_checklist_items (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    checklist_item_id BIGINT REFERENCES act_checklist_items(id) ON DELETE SET NULL,
    
    label VARCHAR(255) NOT NULL, -- Copy from checklist_item or custom
    is_required BOOLEAN DEFAULT true NOT NULL,
    is_completed BOOLEAN DEFAULT false NOT NULL,
    completed_at TIMESTAMPTZ,
    completed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    notes TEXT,
    sort_order INT DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_case_checklist_items_case_id ON case_checklist_items(case_id);
CREATE INDEX idx_case_checklist_items_is_completed ON case_checklist_items(is_completed);

-- =====================================================
-- SECTION 6: DOCUMENTS
-- =====================================================

CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES cases(id) ON DELETE RESTRICT, -- Can be NULL for office-level docs
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    
    type document_type NOT NULL,
    category document_category NOT NULL,
    status document_status DEFAULT 'DRAFT' NOT NULL,
    
    template_id BIGINT REFERENCES templates(id) ON DELETE SET NULL, -- If generated from template
    
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL, -- bytes
    storage_path VARCHAR(500) NOT NULL, -- S3/Azure path or local path
    storage_bucket VARCHAR(100), -- S3 bucket name
    
    -- Security
    hash VARCHAR(64), -- SHA-256 hash of file content
    encrypted BOOLEAN DEFAULT false NOT NULL,
    
    version_no INT DEFAULT 1 NOT NULL,
    parent_document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL, -- For versioning
    
    -- Metadata
    title VARCHAR(255),
    description TEXT,
    tags VARCHAR(255)[], -- Array of tags for categorization
    metadata JSONB DEFAULT '{}',
    
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_office_id ON documents(office_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_by ON documents(created_by);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_hash ON documents(hash) WHERE hash IS NOT NULL;

-- Composite index for common queries
CREATE INDEX idx_documents_case_category_status ON documents(case_id, category, status);

-- =====================================================
-- SECTION 7: SIGNATURES (E-Signature / QES)
-- =====================================================

CREATE TABLE signatures (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    case_id BIGINT REFERENCES cases(id) ON DELETE RESTRICT,
    
    -- Signer
    signer_client_id BIGINT REFERENCES clients(id) ON DELETE RESTRICT,
    signer_user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT, -- If internal user signing
    signer_name VARCHAR(255) NOT NULL, -- Cached name
    signer_identifier VARCHAR(50), -- CNP or CUI
    
    -- E-signature provider
    provider VARCHAR(50), -- 'CERTINOMIS', 'NAMIRIAL', 'WET_SIGNATURE'
    session_id VARCHAR(255), -- External provider session ID
    signature_type VARCHAR(50) DEFAULT 'QES', -- QES, AES, WET
    
    status signature_status DEFAULT 'PENDING' NOT NULL,
    
    -- Signature details
    signed_at TIMESTAMPTZ,
    signature_data JSONB, -- Certificate info, OCSP response, etc.
    
    -- Position in document (for visual signature)
    page INT,
    x INT,
    y INT,
    width INT,
    height INT,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_signatures_document_id ON signatures(document_id);
CREATE INDEX idx_signatures_case_id ON signatures(case_id);
CREATE INDEX idx_signatures_signer_client_id ON signatures(signer_client_id);
CREATE INDEX idx_signatures_status ON signatures(status);
CREATE INDEX idx_signatures_signed_at ON signatures(signed_at);

-- =====================================================
-- SECTION 8: REPERTORY (Repertoriu Notarial)
-- =====================================================

CREATE TABLE repertory_entries (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    case_id BIGINT REFERENCES cases(id) ON DELETE RESTRICT,
    
    -- Repertory numbering (must be sequential per year per office)
    act_number INT NOT NULL, -- Sequential number within year
    act_year INT NOT NULL,
    act_type repertory_act_type NOT NULL,
    
    act_date DATE NOT NULL,
    
    -- Parties (denormalized for quick access)
    parties_summary TEXT NOT NULL, -- "Vânzător: Ion Popescu, Cumpărător: Maria Ionescu"
    
    subject_matter TEXT NOT NULL, -- Brief description of act
    
    -- Financial
    act_value NUMERIC(15, 2),
    currency VARCHAR(3) DEFAULT 'RON',
    notarial_fee NUMERIC(10, 2), -- Taxa notarială
    
    -- References
    minute_document_id BIGINT REFERENCES documents(id) ON DELETE RESTRICT, -- Link to minute
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT repertory_entries_office_year_number_unique UNIQUE (office_id, act_year, act_number)
);

CREATE INDEX idx_repertory_entries_office_id ON repertory_entries(office_id);
CREATE INDEX idx_repertory_entries_case_id ON repertory_entries(case_id);
CREATE INDEX idx_repertory_entries_act_date ON repertory_entries(act_date);
CREATE INDEX idx_repertory_entries_act_year ON repertory_entries(act_year);
CREATE INDEX idx_repertory_entries_act_type ON repertory_entries(act_type);

-- Full-text search
CREATE INDEX idx_repertory_entries_parties_fulltext ON repertory_entries 
    USING gin(to_tsvector('romanian', COALESCE(parties_summary, '')));
CREATE INDEX idx_repertory_entries_subject_fulltext ON repertory_entries 
    USING gin(to_tsvector('romanian', COALESCE(subject_matter, '')));

-- Mentions on acts (Mențiuni ulterioare pe acte)
CREATE TABLE mentions (
    id BIGSERIAL PRIMARY KEY,
    repertory_entry_id BIGINT NOT NULL REFERENCES repertory_entries(id) ON DELETE RESTRICT,
    case_id BIGINT REFERENCES cases(id) ON DELETE RESTRICT,
    
    mention_type VARCHAR(50) NOT NULL, -- 'RECTIFICATION', 'CANCELLATION', 'ANNOTATION', etc.
    mention_date DATE NOT NULL,
    
    description TEXT NOT NULL,
    
    -- Reference to document if mention has supporting docs
    document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mentions_repertory_entry_id ON mentions(repertory_entry_id);
CREATE INDEX idx_mentions_case_id ON mentions(case_id);
CREATE INDEX idx_mentions_mention_date ON mentions(mention_date);

-- Copy issuance tracking (Eliberare copii legalizate)
CREATE TABLE copy_issuances (
    id BIGSERIAL PRIMARY KEY,
    repertory_entry_id BIGINT NOT NULL REFERENCES repertory_entries(id) ON DELETE RESTRICT,
    case_id BIGINT REFERENCES cases(id) ON DELETE RESTRICT,
    
    copy_number INT NOT NULL, -- Sequential per repertory entry
    issue_date DATE NOT NULL,
    
    issued_to_client_id BIGINT REFERENCES clients(id) ON DELETE RESTRICT,
    issued_to_name VARCHAR(255) NOT NULL, -- Cached name
    
    copy_type VARCHAR(50) DEFAULT 'CERTIFIED_COPY', -- 'CERTIFIED_COPY', 'SIMPLE_COPY', 'EXTRACT'
    
    fee_amount NUMERIC(10, 2),
    currency VARCHAR(3) DEFAULT 'RON',
    
    notes TEXT,
    
    issued_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT copy_issuances_unique UNIQUE (repertory_entry_id, copy_number)
);

CREATE INDEX idx_copy_issuances_repertory_entry_id ON copy_issuances(repertory_entry_id);
CREATE INDEX idx_copy_issuances_issue_date ON copy_issuances(issue_date);
CREATE INDEX idx_copy_issuances_issued_to_client_id ON copy_issuances(issued_to_client_id);

-- =====================================================
-- SECTION 9: CONFLICT OF INTEREST
-- =====================================================

CREATE TABLE conflict_of_interest (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    
    conflict_type VARCHAR(50) NOT NULL, -- 'NOTARY_IS_PARTY', 'NOTARY_IS_RELATIVE', etc.
    severity VARCHAR(20) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    
    detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    description TEXT NOT NULL,
    
    -- Involved parties
    user_id BIGINT REFERENCES users(id) ON DELETE RESTRICT, -- Notary with conflict
    client_id BIGINT REFERENCES clients(id) ON DELETE RESTRICT, -- Client causing conflict
    
    status VARCHAR(20) DEFAULT 'DETECTED' NOT NULL, -- 'DETECTED', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'
    resolution_method VARCHAR(50), -- 'WRITTEN_CONSENT', 'TRANSFER', 'REJECTION'
    resolved_at TIMESTAMPTZ,
    resolved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_conflict_of_interest_office_id ON conflict_of_interest(office_id);
CREATE INDEX idx_conflict_of_interest_case_id ON conflict_of_interest(case_id);
CREATE INDEX idx_conflict_of_interest_status ON conflict_of_interest(status);
CREATE INDEX idx_conflict_of_interest_user_id ON conflict_of_interest(user_id);

-- =====================================================
-- SECTION 10: POWER OF ATTORNEY (Procuri)
-- =====================================================

CREATE TABLE powers_of_attorney (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    case_id BIGINT REFERENCES cases(id) ON DELETE RESTRICT, -- If part of a case
    
    -- Parties
    grantor_client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT, -- Mandant
    attorney_client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT, -- Mandatar
    
    poa_type VARCHAR(50) NOT NULL, -- 'SPECIAL', 'GENERAL'
    scope TEXT NOT NULL, -- Purpose/scope of power of attorney
    
    issue_date DATE NOT NULL,
    expiry_date DATE,
    
    can_substitute BOOLEAN DEFAULT false NOT NULL, -- Can attorney delegate to another?
    
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'EXPIRED', 'REVOKED'
    revoked_at TIMESTAMPTZ,
    revoked_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    revocation_reason TEXT,
    
    -- Document reference
    document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    repertory_entry_id BIGINT REFERENCES repertory_entries(id) ON DELETE SET NULL,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_powers_of_attorney_office_id ON powers_of_attorney(office_id);
CREATE INDEX idx_powers_of_attorney_case_id ON powers_of_attorney(case_id);
CREATE INDEX idx_powers_of_attorney_grantor_client_id ON powers_of_attorney(grantor_client_id);
CREATE INDEX idx_powers_of_attorney_attorney_client_id ON powers_of_attorney(attorney_client_id);
CREATE INDEX idx_powers_of_attorney_status ON powers_of_attorney(status);
CREATE INDEX idx_powers_of_attorney_expiry_date ON powers_of_attorney(expiry_date);

-- =====================================================
-- SECTION 11: SUCCESSIONS (Moșteniri)
-- =====================================================

CREATE TABLE successions (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    
    -- Deceased
    deceased_client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    death_date DATE NOT NULL,
    death_certificate_no VARCHAR(100),
    
    succession_type VARCHAR(20) NOT NULL, -- 'LEGAL', 'TESTAMENTARY', 'MIXED'
    
    -- Will/Testament
    has_will BOOLEAN DEFAULT false NOT NULL,
    will_document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    
    -- Financial
    total_asset_value NUMERIC(15, 2),
    total_debt_value NUMERIC(15, 2),
    net_value NUMERIC(15, 2) GENERATED ALWAYS AS (total_asset_value - COALESCE(total_debt_value, 0)) STORED,
    currency VARCHAR(3) DEFAULT 'RON',
    
    phase VARCHAR(50) DEFAULT 'INTAKE' NOT NULL, -- 'INTAKE', 'INVENTORY', 'HEIRS_IDENTIFICATION', 'ACCEPTANCE', 'PARTITION', 'CLOSED'
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_successions_case_id ON successions(case_id);
CREATE INDEX idx_successions_office_id ON successions(office_id);
CREATE INDEX idx_successions_deceased_client_id ON successions(deceased_client_id);
CREATE INDEX idx_successions_phase ON successions(phase);

-- Heirs
CREATE TABLE heirs (
    id BIGSERIAL PRIMARY KEY,
    succession_id BIGINT NOT NULL REFERENCES successions(id) ON DELETE CASCADE,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    
    relation_to_deceased VARCHAR(50) NOT NULL, -- 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', etc.
    inheritance_class INT, -- 1, 2, 3, 4 (legal classes)
    
    quota_fraction VARCHAR(20), -- '1/4', '1/2', etc.
    quota_decimal NUMERIC(5, 4), -- 0.2500, 0.5000, etc.
    
    is_legal_heir BOOLEAN DEFAULT true NOT NULL,
    is_testamentary_heir BOOLEAN DEFAULT false NOT NULL,
    
    status VARCHAR(20) DEFAULT 'NOT_CONTACTED' NOT NULL, -- 'NOT_CONTACTED', 'CONTACTED', 'ACCEPTED', 'ACCEPTED_WITH_INVENTORY', 'RENOUNCED'
    
    declaration_date DATE,
    declaration_document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT heirs_unique UNIQUE (succession_id, client_id)
);

CREATE INDEX idx_heirs_succession_id ON heirs(succession_id);
CREATE INDEX idx_heirs_client_id ON heirs(client_id);
CREATE INDEX idx_heirs_status ON heirs(status);

-- Assets in succession (links to case_objects)
CREATE TABLE succession_assets (
    id BIGSERIAL PRIMARY KEY,
    succession_id BIGINT NOT NULL REFERENCES successions(id) ON DELETE CASCADE,
    case_object_id BIGINT NOT NULL REFERENCES case_objects(id) ON DELETE CASCADE,
    
    -- Which heir(s) inherit this asset
    assigned_to_heir_id BIGINT REFERENCES heirs(id) ON DELETE SET NULL,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_succession_assets_succession_id ON succession_assets(succession_id);
CREATE INDEX idx_succession_assets_case_object_id ON succession_assets(case_object_id);
CREATE INDEX idx_succession_assets_assigned_to_heir_id ON succession_assets(assigned_to_heir_id);

-- =====================================================
-- SECTION 12: TASKS & WORKFLOW
-- =====================================================

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    case_id BIGINT REFERENCES cases(id) ON DELETE CASCADE, -- Can be NULL for general tasks
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    status task_status DEFAULT 'TODO' NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
    
    due_date DATE,
    due_time TIME,
    
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    completed_at TIMESTAMPTZ,
    completed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    -- Checklist within task
    checklist JSONB DEFAULT '[]', -- [{"label": "...", "is_completed": false}, ...]
    
    -- Attachments (links to documents)
    attachment_document_ids BIGINT[] DEFAULT '{}',
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_tasks_office_id ON tasks(office_id);
CREATE INDEX idx_tasks_case_id ON tasks(case_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- =====================================================
-- SECTION 13: APPOINTMENTS / CALENDAR
-- =====================================================

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    case_id BIGINT REFERENCES cases(id) ON DELETE CASCADE, -- Can be NULL for general appointments
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    
    location VARCHAR(255), -- Room number or address
    room VARCHAR(100),
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT false,
    reminder_sent_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(20) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT appointments_start_before_end CHECK (start_at < end_at)
);

CREATE INDEX idx_appointments_office_id ON appointments(office_id);
CREATE INDEX idx_appointments_case_id ON appointments(case_id);
CREATE INDEX idx_appointments_start_at ON appointments(start_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_by ON appointments(created_by);

-- Composite index for calendar queries (office + date range)
CREATE INDEX idx_appointments_office_start ON appointments(office_id, start_at);

-- Attendees
CREATE TABLE appointment_attendees (
    id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE, -- Internal user
    client_id BIGINT REFERENCES clients(id) ON DELETE CASCADE, -- External client
    
    role VARCHAR(50), -- 'NOTARY', 'ASSISTANT', 'CLIENT', 'WITNESS'
    
    attendance_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'DECLINED', 'ATTENDED', 'NO_SHOW'
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT appointment_attendees_user_or_client CHECK (
        (user_id IS NOT NULL AND client_id IS NULL) OR 
        (user_id IS NULL AND client_id IS NOT NULL)
    )
);

CREATE INDEX idx_appointment_attendees_appointment_id ON appointment_attendees(appointment_id);
CREATE INDEX idx_appointment_attendees_user_id ON appointment_attendees(user_id);
CREATE INDEX idx_appointment_attendees_client_id ON appointment_attendees(client_id);

-- =====================================================
-- SECTION 14: BILLING (Invoices & Payments)
-- =====================================================

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    case_id BIGINT REFERENCES cases(id) ON DELETE RESTRICT, -- Can be NULL for standalone invoices
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    
    invoice_number VARCHAR(50) NOT NULL, -- Unique per office
    series VARCHAR(20), -- Series prefix (e.g. "FACT", "PROF")
    
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    currency VARCHAR(3) DEFAULT 'RON' NOT NULL,
    
    subtotal_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0, -- VAT if applicable
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    
    paid_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    balance_due NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    
    status invoice_status DEFAULT 'DRAFT' NOT NULL,
    
    notes TEXT,
    terms_and_conditions TEXT,
    
    metadata JSONB DEFAULT '{}',
    
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT invoices_office_number_unique UNIQUE (office_id, invoice_number)
);

CREATE INDEX idx_invoices_office_id ON invoices(office_id);
CREATE INDEX idx_invoices_case_id ON invoices(case_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Invoice line items
CREATE TABLE invoice_lines (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    tax_percent NUMERIC(5, 2) DEFAULT 0, -- VAT rate (usually 19% in Romania)
    
    line_total NUMERIC(12, 2) NOT NULL,
    
    sort_order INT DEFAULT 0,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);

-- Payments
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE RESTRICT,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RON' NOT NULL,
    
    paid_at TIMESTAMPTZ NOT NULL,
    
    method payment_method NOT NULL,
    reference VARCHAR(255), -- Transaction reference, receipt number, etc.
    
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    recorded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT payments_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_payments_office_id ON payments(office_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);
CREATE INDEX idx_payments_method ON payments(method);

-- =====================================================
-- SECTION 15: INTEGRATIONS
-- =====================================================

CREATE TABLE integration_configs (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
    
    type integration_type NOT NULL,
    provider_name VARCHAR(100) NOT NULL, -- 'CERTINOMIS', 'SENDGRID', 'TWILIO', etc.
    
    config JSONB NOT NULL DEFAULT '{}', -- API keys, endpoints, etc. (should be encrypted)
    
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- Testing
    test_mode BOOLEAN DEFAULT false NOT NULL,
    
    -- Rate limits
    rate_limit_per_minute INT,
    rate_limit_per_day INT,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT integration_configs_unique UNIQUE (office_id, type, provider_name)
);

CREATE INDEX idx_integration_configs_office_id ON integration_configs(office_id);
CREATE INDEX idx_integration_configs_type ON integration_configs(type);
CREATE INDEX idx_integration_configs_is_active ON integration_configs(is_active);

-- Integration logs (track API calls)
CREATE TABLE integration_logs (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT REFERENCES offices(id) ON DELETE SET NULL,
    integration_config_id BIGINT REFERENCES integration_configs(id) ON DELETE SET NULL,
    
    type integration_type NOT NULL,
    provider_name VARCHAR(100) NOT NULL,
    
    action VARCHAR(100) NOT NULL, -- 'VERIFY_CUI', 'SEND_EMAIL', 'CREATE_SIGNING_SESSION', etc.
    
    request_data JSONB, -- Request payload (sanitized, no secrets)
    response_data JSONB, -- Response payload
    
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILURE', 'TIMEOUT'
    http_status_code INT,
    error_message TEXT,
    
    duration_ms INT, -- Response time in milliseconds
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Partitioned by month for performance
CREATE INDEX idx_integration_logs_office_id ON integration_logs(office_id);
CREATE INDEX idx_integration_logs_type ON integration_logs(type);
CREATE INDEX idx_integration_logs_status ON integration_logs(status);
CREATE INDEX idx_integration_logs_created_at ON integration_logs(created_at);

-- =====================================================
-- SECTION 16: AUDIT LOG
-- =====================================================

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT REFERENCES offices(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL, -- NULL if system action
    
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'SIGN', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'CASE', 'CLIENT', 'DOCUMENT', 'INVOICE', etc.
    entity_id BIGINT, -- ID of the affected entity
    
    description TEXT, -- Human-readable description
    
    -- Change tracking
    old_values JSONB, -- Before state
    new_values JSONB, -- After state
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- This table is append-only (no updates/deletes)
-- Partition by month for better performance
CREATE INDEX idx_audit_logs_office_id ON audit_logs(office_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Composite index for common audit queries
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- SECTION 17: NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    office_id BIGINT REFERENCES offices(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- 'TASK_ASSIGNED', 'APPOINTMENT_REMINDER', 'DOCUMENT_SIGNED', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related entities
    related_entity_type VARCHAR(50), -- 'CASE', 'TASK', 'APPOINTMENT', etc.
    related_entity_id BIGINT,
    
    -- Delivery
    is_read BOOLEAN DEFAULT false NOT NULL,
    read_at TIMESTAMPTZ,
    
    -- Channels
    sent_via_email BOOLEAN DEFAULT false,
    sent_via_sms BOOLEAN DEFAULT false,
    sent_via_push BOOLEAN DEFAULT false,
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ -- Auto-delete after this date
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- =====================================================
-- SECTION 18: SYSTEM SETTINGS & METADATA
-- =====================================================

CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false NOT NULL, -- Can be exposed to frontend?
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_system_settings_key ON system_settings(key);

-- Exchange rates (for multi-currency support)
CREATE TABLE exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    base_currency VARCHAR(3) DEFAULT 'RON' NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(12, 6) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'BNR', -- 'BNR', 'ECB', 'MANUAL'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT exchange_rates_unique UNIQUE (base_currency, target_currency, rate_date)
);

CREATE INDEX idx_exchange_rates_date ON exchange_rates(rate_date);
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(base_currency, target_currency);

-- =====================================================
-- SECTION 19: FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND column_name = 'updated_at'
    LOOP
        EXECUTE format('
            CREATE TRIGGER trigger_update_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t);
    END LOOP;
END $$;

-- Function to validate CNP checksum (Romanian Personal Numeric Code)
CREATE OR REPLACE FUNCTION validate_cnp(cnp VARCHAR(13))
RETURNS BOOLEAN AS $$
DECLARE
    weights INT[] := ARRAY[2,7,9,1,4,6,3,5,8,2,7,9];
    sum INT := 0;
    control_digit INT;
    i INT;
BEGIN
    -- Check length
    IF LENGTH(cnp) != 13 THEN
        RETURN FALSE;
    END IF;
    
    -- Check if all digits
    IF cnp !~ '^\d{13}$' THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate checksum
    FOR i IN 1..12 LOOP
        sum := sum + (SUBSTRING(cnp, i, 1)::INT * weights[i]);
    END LOOP;
    
    control_digit := sum % 11;
    IF control_digit = 10 THEN
        control_digit := 1;
    END IF;
    
    -- Verify control digit
    RETURN control_digit = SUBSTRING(cnp, 13, 1)::INT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate next repertory number for a year
CREATE OR REPLACE FUNCTION get_next_repertory_number(p_office_id BIGINT, p_year INT)
RETURNS INT AS $$
DECLARE
    next_num INT;
BEGIN
    SELECT COALESCE(MAX(act_number), 0) + 1
    INTO next_num
    FROM repertory_entries
    WHERE office_id = p_office_id
      AND act_year = p_year;
    
    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice balance (redundant with generated column, but useful for triggers)
CREATE OR REPLACE FUNCTION update_invoice_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices
    SET paid_amount = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE invoice_id = NEW.invoice_id
    ),
    status = CASE
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total_amount THEN 'PAID'::invoice_status
        WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = NEW.invoice_id) > 0 THEN 'PARTIALLY_PAID'::invoice_status
        ELSE status
    END
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_paid_amount
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_paid_amount();

-- Function to prevent modification of signed documents
CREATE OR REPLACE FUNCTION prevent_signed_document_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'SIGNED' AND NEW.status != 'SIGNED' THEN
        RAISE EXCEPTION 'Cannot modify status of signed document';
    END IF;
    
    IF OLD.status = 'SIGNED' AND OLD.hash != NEW.hash THEN
        RAISE EXCEPTION 'Cannot modify content of signed document';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_signed_document_modification
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION prevent_signed_document_modification();

-- Function to make audit logs immutable
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_audit_log_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

CREATE TRIGGER trigger_prevent_audit_log_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();

-- =====================================================
-- SECTION 20: ROW LEVEL SECURITY (RLS) - Placeholder
-- =====================================================

-- Enable RLS on main tables (implementation depends on auth system)
-- Example for multi-tenant isolation:

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only see data from their office
-- Note: This assumes current_setting('app.current_office_id') is set by application
/*
CREATE POLICY office_isolation_policy ON cases
    FOR ALL
    USING (office_id = current_setting('app.current_office_id')::BIGINT);

-- Repeat for other tables...
*/

-- =====================================================
-- SECTION 21: INITIAL DATA (Optional)
-- =====================================================

-- Insert default system settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
    ('app.version', '"1.0.0"', 'Application version', true),
    ('app.maintenance_mode', 'false', 'Maintenance mode flag', true),
    ('notarial.repertory_start_number', '1', 'Starting number for repertory entries each year', false),
    ('notarial.default_currency', '"RON"', 'Default currency for transactions', false),
    ('billing.vat_rate', '0.19', 'Default VAT rate (19% in Romania)', false),
    ('billing.payment_terms_days', '30', 'Default payment terms (days)', false);

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Grant permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lexnotar_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lexnotar_app;
