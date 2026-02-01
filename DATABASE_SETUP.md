# Database Setup Guide

This guide will help you set up PostgreSQL for Matrix Equipment Finance.

## Prerequisites

You need PostgreSQL installed on your system.

### Install PostgreSQL

**Windows:**
```bash
# Using Chocolatey
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Setup Steps

### 1. Create Database

```bash
# Connect to PostgreSQL (default user is 'postgres')
psql -U postgres

# Create database
CREATE DATABASE matrix_finance;

# Create user (optional - or use existing postgres user)
CREATE USER matrix_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE matrix_finance TO matrix_user;

# Exit psql
\q
```

### 2. Configure Environment

The `.env.local` file has been created with default settings:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/matrix_finance
```

**Update if needed:**
- Change `postgres:postgres` to `username:password`
- Change `localhost` to your database host
- Change `5432` to your PostgreSQL port
- Change `matrix_finance` to your database name

### 3. Run Migration

```bash
# Run database migration (creates all tables and seed data)
npm run db:migrate
```

You should see output like:
```
🔄 Starting database migration...
📡 Connecting to database...
✅ Connected successfully
📄 Reading schema file...
✅ Schema file loaded
🔨 Creating database schema...
✅ Database schema created successfully
🔍 Verifying tables...
✅ Created 12 tables:
   - addresses
   - applications
   - contacts
   - crm_sync_log
   - documents
   - esign_requests
   - financial_positions
   - loan_terms
   - rate_bands
   - sessions
✅ Seeded 5 rate bands
✅ Seeded 4 loan terms
🎉 Migration completed successfully!
```

### 4. Verify Setup

```bash
# Check database status
npm run db:status
```

You should see:
```
🔍 Checking database status...
📡 Connecting to database...
✅ Connection successful
📊 PostgreSQL Version:
   PostgreSQL 16.x ...
📋 Tables (12):
   - addresses
   - applications
   - contacts
   ...
📊 Data Summary:
   - applications            0 rows
   - contacts               0 rows
   - rate_bands             5 rows
   - loan_terms             4 rows
   - documents              0 rows
   - esign_requests         0 rows
✅ Database is healthy
```

## Database Scripts

### Migration
Creates all tables and seeds initial data:
```bash
npm run db:migrate
```

### Status Check
Shows database connection and table information:
```bash
npm run db:status
```

### Reset (⚠️ DANGER)
Drops all tables and data:
```bash
npm run db:reset
```

Then re-run migration:
```bash
npm run db:migrate
```

## Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED`

**Solution:** PostgreSQL may not be running. Start it:
- **macOS:** `brew services start postgresql@16`
- **Linux:** `sudo systemctl start postgresql`
- **Windows:** Check Services or run `pg_ctl start`

### Authentication Failed

**Error:** `password authentication failed for user "postgres"`

**Solution:** Update `.env.local` with correct username/password

### Database Does Not Exist

**Error:** `database "matrix_finance" does not exist`

**Solution:** Create the database (see Step 1 above)

### Permission Denied

**Error:** `permission denied for schema public`

**Solution:** Grant privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE matrix_finance TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

## Database Schema

The migration creates:

### Core Tables
- `applications` - Finance applications
- `contacts` - Applicants, directors, trustees
- `addresses` - Business and contact addresses
- `financial_positions` - Assets and liabilities

### Supporting Tables
- `rate_bands` - Interest rate tiers
- `loan_terms` - Available loan terms
- `documents` - Uploaded files
- `esign_requests` - Dropbox Sign requests
- `sessions` - User sessions
- `crm_sync_log` - CRM synchronization

### Seeded Data

**Rate Bands (5 tiers):**
| Range | Annual Rate |
|-------|-------------|
| $5,000 - $24,999 | 15.95% |
| $25,000 - $49,999 | 13.95% |
| $50,000 - $99,999 | 12.45% |
| $100,000 - $249,999 | 11.45% |
| $250,000 - $500,000 | 9.95% |

**Loan Terms:**
- 24 months
- 36 months
- 48 months
- 60 months

## Next Steps

After successful migration:

1. ✅ Database is ready
2. ✅ Tables created
3. ✅ Rate bands seeded
4. ✅ Application can now use real database
5. 🚀 Start dev server: `npm run dev`

The calculator and application flow will now use the database instead of mock data!
