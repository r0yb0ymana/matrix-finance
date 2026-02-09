# Matrix Equipment Finance - Application Platform

A web-based application platform for business equipment financing, supporting multiple entity types (Sole Trader, Company, Trust) with integrated ABN lookup, calculators, e-signatures, and CRM sync.

## 🎯 Project Overview

Matrix Equipment Finance provides a streamlined digital application process for businesses seeking equipment finance. The platform automates eligibility checks, pre-approval processes, and integrates with external services for verification and CRM management.

### Key Features

- 💰 **Finance Calculators** - Payment, Rate, and Loan Amount calculators with dynamic rate bands
- 🏢 **Multi-Entity Support** - Sole Trader, Company, Trust (Individual & Company Trustee), Partnership
- 🔍 **ABN Verification** - Automatic business lookup and data pre-fill via Australian Business Register
- ✍️ **E-Signatures** - Integrated Dropbox Sign (HelloSign) for document signing
- 📄 **Document Management** - Cloudflare R2 storage for bank statements, ID documents, and contracts
- 🔄 **CRM Integration** - Bi-directional sync with Findesk CRM
- 🛡️ **Secure Authentication** - Magic link + OTP email verification (no passwords)

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (React 19, TypeScript)
- **Database:** PostgreSQL 14+
- **Styling:** Tailwind CSS 4 with custom design tokens
- **UI Components:** Radix UI primitives
- **Hosting:** Railway
- **Storage:** Cloudflare R2

## 📁 Project Structure

```
matrix-finance/
├── database/
│   ├── schema.sql              # PostgreSQL database schema
│   └── README.md               # Database documentation
├── src/
│   ├── app/
│   │   ├── api/                # Next.js API routes
│   │   │   └── health/         # Health check endpoint
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   └── ui/                 # Reusable UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── progress-steps.tsx
│   │       ├── checkbox.tsx
│   │       ├── file-upload.tsx
│   │       └── index.ts
│   ├── lib/
│   │   ├── db.ts               # Database connection utility
│   │   └── utils.ts            # Helper functions
│   ├── styles/
│   │   └── design-tokens.ts    # Brand colors, typography, spacing
│   └── types/
│       └── database.types.ts   # TypeScript database types
├── .env.example                # Environment variables template
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+ (local or hosted)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd matrix-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your database connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/matrix_finance_dev"
   NEXT_PUBLIC_APP_URL="http://localhost:5000"
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb matrix_finance_dev

   # Run schema
   psql -d matrix_finance_dev -f database/schema.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5000](http://localhost:5000) in your browser.

### Verify Setup

Check database connectivity:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T...",
  "checks": {
    "database": "ok"
  },
  "responseTime": "15ms"
}
```

## 📊 Database Schema

The database is designed to support all entity types with a flexible structure:

### Core Tables

- **applications** - Main application data with support for all entity types
- **contacts** - Directors, trustees, beneficiaries, partners
- **financial_positions** - Assets and liabilities with auto-calculated totals
- **documents** - Document metadata and S3 references
- **esign_requests** - Dropbox Sign integration tracking
- **crm_sync_log** - Findesk CRM synchronization history

### Authentication Tables

- **staff_users** - Admin dashboard users
- **otp_codes** - One-time passwords for email verification
- **magic_links** - Email-based authentication links
- **sessions** - Active user sessions

### Configuration Tables

- **rate_bands** - Interest rates by loan amount
- **loan_terms** - Available loan terms (24, 36, 48, 60 months)
- **app_config** - Application settings and feature flags

See [database/README.md](database/README.md) for detailed schema documentation.

## 🎨 Design System

The application follows the Matrix Equipment Finance brand guidelines:

### Colors

- **Primary Navy:** `#1E2C5E` - Headers, buttons, primary actions
- **Light Blue:** `#F5F8FC` - Page backgrounds, cards
- **White:** `#FFFFFF` - Card backgrounds, inputs
- **Success:** `#10B981` - Approvals, positive actions
- **Error:** `#EF4444` - Errors, warnings

### Typography

- **Headings:** Poppins (600/700 weight)
- **Body:** Inter (400/500 weight)
- **Base size:** 16px

### UI Patterns

- Rounded corners (8px radius)
- Subtle shadows on cards
- Clean spacing with white-space emphasis
- Professional, approachable aesthetic

**Figma Design:** [View Design File](https://www.figma.com/design/ZFRChK7VXmI94NQx9PxJ4x/)

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

See [.env.example](.env.example) for all required and optional environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `ABN_LOOKUP_GUID` - ABN Lookup API key
- `HELLOSIGN_API_KEY` - Dropbox Sign API key
- `FINDESK_API_KEY` - Findesk CRM API key
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - S3 credentials

## 📋 Build Phases

### ✅ Phase 1: Foundation (COMPLETED)

- [x] Database schema design (all entity types)
- [x] TypeScript types for database models
- [x] Database connection utility with pooling
- [x] Health check API endpoint
- [x] Environment configuration
- [x] Project documentation

### 🚧 Phase 2: Core Application Flow (IN PROGRESS)

- [ ] Authentication system (magic link + OTP)
- [ ] Base layout and navigation
- [ ] Finance calculators (Payment, Rate, Loan Amount)
- [ ] ABN Lookup integration
- [ ] Sole Trader application flow (8 screens)

### 📅 Phase 3: Documents & Signatures (PLANNED)

- [ ] AWS S3 document upload
- [ ] File upload UI components
- [ ] Dropbox Sign integration
- [ ] Document verification workflow

### 📅 Phase 4: Admin & Integration (PLANNED)

- [ ] Staff dashboard
- [ ] Application search and filtering
- [ ] Status management
- [ ] Findesk CRM sync

### 📅 Phase 5: Expand Entity Types (PLANNED)

- [ ] Company flow (12 screens, up to 4 directors)
- [ ] Trust Individual flow (12 screens, up to 4 trustees)
- [ ] Trust Company flow (18 screens, 2 ABN lookups)

## 📋 Complete Sole Trader Workflow

### Authentication
- `/login` - Email + OTP verification

### Application Steps (8 total)

**Step 1: Product Selection**
- `/application/product-selection`

**Step 2: Business Lookup**
- `/application/business-lookup` (ABN entry)

**Step 3: Business Confirmation & Trading Info**
- `/application/business-confirmation` (Review ABN data)
- `/application/trading-information` (First trading info screen)
- `/application/business-details` (Second business details screen)

**Step 4: Personal Information**
- `/application/applicant-details`

**Step 5: Financial Position - Assets**
- `/application/financial-position-assets`

**Step 6: Financial Position - Liabilities**
- `/application/financial-position-liabilities`

**Step 7: Identity Documents**
- `/application/documents`

**Step 8: Business Documents**
- `/application/business-documents`

### Final Steps
- `/application/review` - Review all information
- `/application/sign` - E-signature
- `/application/success` or `/application/submitted` - Confirmation

### Key Data Flow
- `ApplicationContext` stores state across all screens
- Each screen validates and saves data before continuing
- `markStepComplete()` tracks progress
- Guards redirect if required data missing

## 🔐 Security

- **Authentication:** Magic link + OTP (no passwords)
- **Encryption:** TLS 1.3 in transit, AES-256 at rest
- **Compliance:** PCI-DSS, SOC2
- **Data Residency:** Australian hosting (Sydney region)
- **Session Management:** Secure HTTP-only cookies, CSRF protection

## 📚 External Integrations

### Required APIs for Sole Trader Application

| API | Purpose | Status | Required? |
|-----|---------|--------|-----------|
| **ABN Lookup API** | Business verification + ASIC number | ✅ GUID configured | ✅ Required |
| **Resend** | Send emails (magic links, OTP) | ✅ API key configured | ✅ Required |
| **Dropbox Sign** | E-signatures for contracts | ✅ API key configured | ✅ Required |
| **Cloudflare R2** | Document storage (ID, bank statements) | ✅ API key configured | ✅ Required |
| **bankstatements.com.au** | Manual bank statement retrieval link | ✅ Integrated | ✅ Required |
| **Findesk CRM** | Backend CRM sync | ✅ API credentials configured | ✅ Required |

### Integration Details

**ABN Lookup API**
- Provider: Australian Business Register (ABR)
- Endpoint: `https://abr.business.gov.au/abrxmlsearch/AbrXmlSearch.asmx`
- Environment: `ABN_LOOKUP_GUID`
- Register: https://abr.business.gov.au/Tools/WebServices
- Used in: Step 2 - Business Lookup

**Resend** (Email Service)
- Provider: Resend
- Endpoint: `https://api.resend.com/emails`
- Environment: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Register: https://resend.com
- Used in: Authentication (magic links, OTP codes)

**Dropbox Sign** (E-Signatures)
- Provider: Dropbox Sign (formerly HelloSign)
- Environment: `DROPBOX_SIGN_API_KEY`
- Register: https://sign.dropbox.com
- Used in: Step 8 - Review & Sign

**Cloudflare R2** (Document Storage)
- Provider: Cloudflare
- Environment: `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- Cost: FREE (10GB included), $0 egress fees
- Used in: Steps 6 & 7 - Document uploads

**bankstatements.com.au** (Open Banking)
- Provider: bankstatements.com.au
- Purpose: Automated bank statement retrieval
- Environment: `BANKSTATEMENTS_API_KEY`
- Endpoints: `/api/bankstatements/connect`, `/api/bankstatements/fetch`
- Status: ✅ Code built, needs API key

**Findesk CRM**
- Provider: Findesk
- Base URL: `https://app.findesk.com.au/api/v1`
- Environment: `FINDESK_BEARER_TOKEN`, `FINDESK_ENTERPRISE_ID`
- Endpoints: `/api/crm/sync`, `/api/crm/webhook`
- Purpose: Bi-directional application sync
- Status: ✅ Code built, needs API key

## 🤝 Contributing

This is a private project for Matrix Equipment Finance. Contact the project lead for contribution guidelines.

## 📄 License

Proprietary - Matrix Equipment Finance © 2026

## 📞 Support

For technical questions or issues:
- Email: dev@matrixfinance.com.au
- Internal wiki: [Link to internal documentation]

---

**Current Version:** 0.1.0 (Alpha)
**Last Updated:** January 31, 2026
