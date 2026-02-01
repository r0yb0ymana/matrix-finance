# Matrix Equipment Finance - Database Documentation

## Overview

This directory contains the PostgreSQL database schema and related files for the Matrix Equipment Finance application platform.

## Schema Design Principles

### 1. **Entity Flexibility**
The schema is designed to support all entity types from a single table structure:
- Sole Trader
- Company
- Trust with Individual Trustee
- Trust with Company Trustee
- Partnership (future)

### 2. **Normalization**
- Contacts (directors, trustees, beneficiaries) are stored in a separate `contacts` table with a `role` field
- Financial position data is separated for cleaner queries
- Documents are linked to both applications and specific contacts

### 3. **Audit Trail**
- All tables have `created_at` and `updated_at` timestamps
- Dedicated `audit_log` table tracks all significant changes
- Soft deletes where appropriate (using status fields)

### 4. **Integration Ready**
- CRM sync log with retry logic
- E-signature request tracking
- Calculator history for analytics
- Webhook event storage (JSONB arrays)

## Files

```
database/
├── schema.sql           # Complete database schema with seed data
├── migrations/          # Database migrations (to be created)
│   ├── 001_initial_schema.sql
│   └── ...
└── README.md           # This file
```

## Database Setup

### Local Development

1. **Install PostgreSQL 14+**
   ```bash
   # Windows (using chocolatey)
   choco install postgresql

   # Or download from: https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   psql -U postgres
   CREATE DATABASE matrix_finance_dev;
   \c matrix_finance_dev
   ```

3. **Run Schema**
   ```bash
   psql -U postgres -d matrix_finance_dev -f database/schema.sql
   ```

### Production (Vercel/Railway)

#### Option A: Vercel Postgres
```bash
# Install Vercel CLI
npm i -g vercel

# Create Postgres database
vercel postgres create matrix-finance-prod

# Get connection string
vercel postgres show matrix-finance-prod
```

#### Option B: Railway
1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string from service details
5. Run migrations via Railway CLI or web interface

## Environment Variables

Add to `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# For connection pooling (recommended for serverless)
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

## Schema Overview

### Core Tables

#### `applications`
Main application table supporting all entity types.
- Auto-generates application numbers (MX-YYYYMMDD-XXXX)
- Tracks calculator results and financial summary
- Flexible fields for different entity types

#### `contacts`
Stores all people associated with an application:
- Primary applicants
- Directors (for companies)
- Trustees (for trusts)
- Trustee directors (for trust with company trustee)
- Beneficiaries (for trusts)
- Partners (for partnerships)

**Key Fields:**
- `role`: Determines the person's relationship to the application
- `contact_order`: 1 = primary, 2-4 = additional
- `is_primary`: Flag for the primary contact in each role

#### `financial_positions`
Assets and liabilities with auto-calculated totals.
- Uses PostgreSQL `GENERATED ALWAYS AS` for automatic calculations
- Syncs totals back to `applications` table via trigger

#### `documents`
Document storage references and metadata.
- Links to S3 storage locations
- Supports both general application documents and contact-specific documents
- Tracks verification status

#### `esign_requests`
Dropbox Sign (HelloSign) integration.
- Stores signature request details
- Webhook events for status updates
- Embedded signing URLs

#### `crm_sync_log`
Findesk CRM synchronization with retry logic.
- Tracks all sync attempts
- Automatic retry scheduling for failed syncs
- Request/response payload storage

### Authentication & Sessions

#### `otp_codes`
One-time passwords for email verification.
- 4-digit codes
- 10-minute expiry (configurable)
- Rate limiting via application logic

#### `magic_links`
Email-based authentication links.
- Unique tokens
- 24-hour expiry (configurable)
- Links to specific applications

#### `sessions`
Active user sessions.
- Supports both applicants and staff
- Automatic expiry and cleanup
- Tracks IP and user agent

#### `staff_users`
Admin dashboard users.
- Role-based access (staff, admin, manager)
- Separate from applicant authentication

### Configuration

#### `rate_bands`
Interest rate configuration based on loan amount.
- Supports historical rates via `effective_from`/`effective_to`
- Admin-configurable via dashboard

#### `loan_terms`
Available loan terms (24, 36, 48, 60 months).
- Display order for UI
- Enable/disable terms without deletion

#### `app_config`
Key-value configuration storage.
- Application fee
- Min/max loan amounts
- Feature flags

## Key Features

### 1. Auto-Generated Application Numbers
Format: `MX-YYYYMMDD-XXXX`
- MX = Matrix prefix
- YYYYMMDD = Date
- XXXX = Sequential number (0001, 0002, etc.)

Handled by `generate_application_number()` trigger.

### 2. Financial Position Auto-Calculation
Total assets, liabilities, and net position are automatically calculated using PostgreSQL generated columns:
```sql
total_assets GENERATED ALWAYS AS (
  home_value + investment_property_value + cash_at_bank + ...
) STORED
```

### 3. Automatic Timestamp Management
All tables with `updated_at` columns automatically update via trigger:
```sql
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Full-Text Search Ready
GIN indexes on business names for fast searching:
```sql
CREATE INDEX idx_applications_business_name_trgm
ON applications USING gin(business_name gin_trgm_ops);
```

Requires `pg_trgm` extension (included in most PostgreSQL distributions).

## Entity Type Workflows

### Sole Trader
1. One entry in `contacts` with `role = 'primary_applicant'`
2. Financial position linked to applicant
3. Documents linked to applicant contact

### Company
1. Up to 4 entries in `contacts` with `role = 'director'`
2. First director (`contact_order = 1`) is the primary contact
3. Documents linked to primary director

### Trust - Individual Trustee
1. Up to 4 entries in `contacts` with `role = 'trustee'`
2. First trustee is the primary contact
3. Trust ABN stored in `applications.abn`

### Trust - Company Trustee
1. Trust ABN in `applications.trust_abn`
2. Trustee company ABN in `applications.trustee_company_abn`
3. Up to 4 trustee directors: `contacts` with `role = 'trustee_director'`
4. Up to 4 beneficiaries: `contacts` with `role = 'beneficiary'`

## Seed Data

The schema includes default seed data:

### Rate Bands
| Min Amount | Max Amount | Annual Rate |
|------------|------------|-------------|
| $5,000     | $20,000    | 15.95%      |
| $20,001    | $75,000    | 11.65%      |
| $75,001    | $150,000   | 10.70%      |
| $150,001   | $250,000   | 10.30%      |
| $250,001   | $500,000   | 9.95%       |

### Loan Terms
- 24 months
- 36 months
- 48 months
- 60 months

### Default Admin User
- **Email:** admin@matrixfinance.com.au
- **Role:** admin
- **Note:** Change password immediately in production

## Indexes for Performance

### High-Priority Indexes
- `applications.status` - Dashboard filtering
- `applications.abn` - ABN lookup
- `applications.business_name` - Full-text search
- `applications.created_at DESC` - Recent applications

### Relationship Indexes
- `contacts.application_id` - Join optimization
- `documents.application_id` - Document retrieval
- `crm_sync_log.application_id` - Sync status checks

## Maintenance

### Cleanup Old Sessions
```sql
DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '7 days';
DELETE FROM otp_codes WHERE created_at < NOW() - INTERVAL '7 days';
DELETE FROM magic_links WHERE created_at < NOW() - INTERVAL '7 days';
```

Recommended: Set up a cron job or scheduled task.

### Archive Old Applications
```sql
-- Move settled applications older than 7 years to archive
-- (Australian record-keeping requirements: 7 years)
CREATE TABLE applications_archive (LIKE applications INCLUDING ALL);

INSERT INTO applications_archive
SELECT * FROM applications
WHERE status = 'settled'
  AND settled_at < NOW() - INTERVAL '7 years';
```

## Migration Strategy

### Initial Migration
1. Run `schema.sql` to create all tables
2. Verify seed data is loaded
3. Create default admin user

### Future Migrations
Create numbered migration files:
```sql
-- migrations/002_add_field_to_applications.sql
ALTER TABLE applications ADD COLUMN new_field VARCHAR(255);
```

Track applied migrations in a `schema_migrations` table:
```sql
CREATE TABLE schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

1. **Encryption at Rest**
   - Enable database encryption on hosting provider
   - Encrypt S3 buckets (AES-256)

2. **Connection Security**
   - Always use SSL/TLS connections (`sslmode=require`)
   - Use connection pooling for serverless environments

3. **Access Control**
   - Separate database users for application vs. admin access
   - Principle of least privilege

4. **Sensitive Data**
   - Never log full ABN, ACN, or personal details
   - Mask data in application logs
   - Use audit log for compliance

## Troubleshooting

### Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check connection pooling
SELECT count(*) FROM pg_stat_activity;
```

### Trigger Not Firing
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'update_applications_updated_at';

-- Recreate trigger if needed
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Index Issues
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Rebuild indexes if needed
REINDEX TABLE applications;
```

## Next Steps

1. [ ] Choose hosting provider (Vercel Postgres or Railway)
2. [ ] Create production database
3. [ ] Run schema.sql on production
4. [ ] Set up DATABASE_URL environment variable
5. [ ] Configure connection pooling
6. [ ] Set up automated backups
7. [ ] Create database user for application (non-superuser)
8. [ ] Test connection from Next.js app
