# API Implementation Plan
**Matrix Equipment Finance - Sole Trader Application**

Last Updated: February 2, 2026

---

## 📋 Overview

This document outlines the implementation plan for all external API integrations required for the Sole Trader application workflow. The plan includes current status, implementation steps, and testing strategies for each integration.

## 🏗️ Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 |
| Hosting | Railway |
| Database | PostgreSQL (Railway) |
| Storage | Cloudflare R2 |
| Auth | Magic Link + OTP (email) |
| E-Signature | Dropbox Sign (HelloSign) |
| CRM | Findesk API |
| ABN Lookup | Government API |
| Bank Statements | bankstatements.com.au |

## 🎯 Required APIs Summary

| # | API | Priority | Status | Required? |
|---|-----|----------|--------|-----------|
| 1 | ABN Lookup API | High | ✅ GUID configured | ✅ Required |
| 2 | Resend | High | ✅ API key configured | ✅ Required |
| 3 | Cloudflare R2 | High | ✅ API key configured | ✅ Required |
| 4 | Dropbox Sign | High | ✅ API key configured | ✅ Required |
| 5 | bankstatements.com.au | High | ✅ Manual link integration | ✅ Required |
| 6 | Findesk CRM | High | ✅ API credentials configured | ✅ Required |

---

## 1️⃣ ABN Lookup API

### Overview
- **Provider:** Australian Business Register (ABR)
- **Purpose:** Verify business details and pre-fill company information
- **Used in:** Step 2 - Business Lookup
- **Status:** ✅ GUID configured in .env.local

### Current Status
✅ **Code Implementation:** Complete
✅ **GUID:** Configured in .env.local
⚠️ **Testing:** Ready to test with real ABNs

**Files:**
- `src/lib/abn-lookup.ts` - Service layer
- `src/app/api/abn/lookup/route.ts` - API route

### Implementation Steps

#### Step 1: Register for ABN Lookup GUID
1. Visit https://abr.business.gov.au/Tools/WebServices
2. Click "Register for a GUID"
3. Fill out registration form (business details required)
4. Receive GUID via email (usually within 1-2 business days)

#### Step 2: Configure Environment
```env
ABN_LOOKUP_GUID=your-guid-here
```

#### Step 3: Test Integration
```bash
curl -X POST http://localhost:5000/api/abn/lookup \
  -H "Content-Type: application/json" \
  -d '{"abn": "51 824 753 556"}'
```

### Next Actions
- [ ] Register for ABN Lookup GUID
- [ ] Add GUID to .env file
- [ ] Test with real ABNs
- [ ] Document any API quirks/limitations

---

## 2️⃣ Resend (Email Service)

### Overview
- **Provider:** Resend
- **Purpose:** Send magic links, OTP codes, application notifications
- **Used in:** Login/Authentication, Application confirmations
- **Status:** ✅ API key configured in .env.local

### Current Status
✅ **Code Implementation:** Complete
✅ **API Key:** Configured in .env.local
⚠️ **Testing:** Ready to test with real API

**Files:**
- `src/lib/email.ts` - Email service
- `src/app/api/auth/request-link/route.ts` - Magic link sender
- `src/app/api/auth/verify-link/route.ts` - OTP sender

### Implementation Steps

#### Step 1: Create Resend Account
1. Visit https://resend.com
2. Sign up for free account (100 emails/day free tier)
3. Verify your email address
4. Add and verify your sending domain (e.g., matrixfinance.com.au)

#### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create new API key
3. Copy the key (starts with `re_`)

#### Step 3: Configure Environment
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@matrixfinance.com.au
USE_MOCK_EMAIL=false
```

### Next Actions
- [ ] Create Resend account
- [ ] Verify sending domain
- [ ] Add API key to .env
- [ ] Test all email templates
- [ ] Configure SPF/DKIM records for domain

---

## 3️⃣ Cloudflare R2 (Document Storage)

### Overview
- **Provider:** Cloudflare R2
- **Purpose:** Store identity documents, bank statements, signed contracts
- **Used in:** Steps 6 & 7 - Document uploads
- **Status:** ✅ API key configured in .env.local

### Why Cloudflare R2 (Not AWS S3)
- **Cost:** FREE (10GB included), then $0.015/GB
- **Egress:** $0 (no download fees)
- **Compatibility:** S3-compatible API (same SDK)
- **Bucket Name:** `matrix-finance-docs`

### Current Status
✅ **Code Implementation:** Complete with mock
✅ **API Key:** Configured in .env.local
⚠️ **Testing:** Ready to test with real API

**Files:**
- `src/app/api/documents/upload/route.ts` - Upload handler

### Implementation Steps

#### Step 1: Create Cloudflare Account
1. Visit https://dash.cloudflare.com
2. Create account (free tier available)
3. Navigate to R2 Storage
4. Create bucket: `matrix-finance-docs`

#### Step 2: Create API Token
1. Go to R2 → Manage R2 API Tokens
2. Create new token with Read/Write permissions
3. Copy Access Key ID and Secret Access Key

#### Step 3: Configure Environment
```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=matrix-finance-docs
```

#### Step 4: Update Upload Code
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Upload file
await r2.send(new PutObjectCommand({
  Bucket: 'matrix-finance-docs',
  Key: `applications/${applicationId}/${documentType}_${timestamp}.pdf`,
  Body: fileBuffer,
  ContentType: 'application/pdf',
}));
```

#### Step 5: Install SDK
```bash
npm install @aws-sdk/client-s3
```

### Cost Estimation
- Storage: FREE up to 10GB, then $0.015/GB/month
- Requests: FREE up to 10M requests
- Egress: $0 (always free)
- Expected: **$0-5/month** for 100 applications

### Next Actions
- [ ] Create Cloudflare account
- [ ] Set up R2 bucket
- [ ] Create API token
- [ ] Add credentials to .env
- [ ] Update upload code to use R2
- [ ] Test upload/download flow

---

## 4️⃣ Dropbox Sign (E-Signatures)

### Overview
- **Provider:** Dropbox Sign (formerly HelloSign)
- **Purpose:** E-signature for finance agreement documents
- **Used in:** Step 8 - Review & Sign
- **Status:** ✅ API key configured in .env.local

### Current Status
✅ **Code Implementation:** Complete with mock
✅ **API Key:** Configured in .env.local
⚠️ **Testing:** Ready to test with real API

**Files:**
- `src/app/api/esign/create/route.ts` - Create signature request
- `src/app/api/esign/status/route.ts` - Check signature status

### Implementation Steps

#### Step 1: Create Dropbox Sign Account
1. Visit https://sign.dropbox.com or https://www.hellosign.com
2. Sign up for account
3. Choose plan:
   - **Free:** 3 documents/month
   - **Essentials:** $20/month - unlimited signatures
   - **Standard:** $40/month - templates + API

#### Step 2: Get API Key
1. Go to Settings → API
2. Enable API access
3. Create API key
4. Copy the key

#### Step 3: Configure Environment
```env
DROPBOX_SIGN_API_KEY=your-api-key-here
DROPBOX_SIGN_TEMPLATE_ID=your-template-id
```

#### Step 4: Install SDK
```bash
npm install dropbox-sign
```

### Next Actions
- [ ] Create Dropbox Sign account
- [ ] Get API key
- [ ] Upload finance agreement template
- [ ] Add API key to .env
- [ ] Install SDK
- [ ] Test signature flow
- [ ] Set up webhook endpoint

---

## 5️⃣ bankstatements.com.au (Open Banking)

### Overview
- **Provider:** bankstatements.com.au
- **Purpose:** Automated bank statement retrieval via Open Banking
- **Used in:** Step 8 - Business Documents
- **Status:** ✅ Code built, needs API key

### Current Status
✅ **Code Implementation:** Complete
✅ **Mock Mode:** Working for development
⚠️ **API Key:** Not configured yet

### Files Created
```
src/
  lib/
    bankstatements.ts              # Service layer with all API functions
  app/
    api/
      bankstatements/
        connect/route.ts           # POST - Initiate bank connection
        callback/route.ts          # GET - OAuth callback handler
        fetch/route.ts             # POST - Fetch statements
        webhook/route.ts           # POST - Handle webhooks
        banks/route.ts             # GET - List supported banks
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/bankstatements/connect` | Start bank connection flow |
| GET | `/api/bankstatements/callback` | OAuth callback (redirect) |
| POST | `/api/bankstatements/fetch` | Fetch statements for connection |
| POST | `/api/bankstatements/webhook` | Receive webhook events |
| GET | `/api/bankstatements/banks` | List supported banks |

### Environment Variables
```env
BANKSTATEMENTS_API_KEY=your-api-key
BANKSTATEMENTS_API_URL=https://api.bankstatements.com.au
BANKSTATEMENTS_WEBHOOK_SECRET=your-webhook-secret
USE_MOCK_BANKSTATEMENTS=true  # Set to false for production
```

### Next Actions
- [ ] Get bankstatements.com.au API documentation
- [ ] Register for API access
- [ ] Add API key to .env
- [ ] Test with real bank connections
- [ ] Update UI to use Connect Bank button

---

## 6️⃣ Findesk CRM

### Overview
- **Provider:** Findesk
- **Purpose:** Bi-directional CRM sync for application management
- **Used in:** Backend sync, staff dashboard
- **Status:** ✅ Code built, needs API key

### API Documentation

**Base URL:** `https://app.findesk.com.au/api/v1`

**Authentication Headers:**
```
Authorization: Bearer <Your_Token>
EnterpriseID: <Your_Enterprise_ID>
Content-Type: application/json
```

### API Endpoints

| Resource | GET (list) | GET (single) | POST | PUT | DELETE |
|----------|------------|--------------|------|-----|--------|
| Leads | /leads?page=1 | /leads/:id | /leads | /leads/:id | /leads/:id |
| Applications | /applications?page=1 | /applications/:id | /applications | /applications/:id | /applications/:id |
| People | /people?page=1 | /people/:id | /people | - | - |
| Organisations | /organisations | /organisations/:id | /organisations | /organisations/:id | - |

### Field Mapping

**Lead Fields:**
- Title, PersonName, Phone, Email
- OrganisationName, FinanceAmount, Deposit, PurchasePrice
- RealestateOwner

**People Fields:**
- PersonID, Title, FirstName, LastName, Email, Phone

### Sync Flow

```
1. Calculator completed (optional)
   └── POST /leads

2. Application submitted
   ├── POST /organisations (create business)
   ├── POST /people (create each director/trustee)
   └── POST /applications (link org + people)

3. Status changes
   └── PUT /applications/:id
```

### Environment Variables
```env
FINDESK_API_URL=https://app.findesk.com.au/api/v1
FINDESK_BEARER_TOKEN=your-bearer-token
FINDESK_ENTERPRISE_ID=your-enterprise-id
```

### Implementation Steps

#### Step 1: Create Service Layer
Create `src/lib/findesk.ts`:
```typescript
const FINDESK_BASE_URL = process.env.FINDESK_API_URL;

const headers = {
  'Authorization': `Bearer ${process.env.FINDESK_BEARER_TOKEN}`,
  'EnterpriseID': process.env.FINDESK_ENTERPRISE_ID!,
  'Content-Type': 'application/json',
};

// Create Lead
export async function createLead(data: LeadData) {
  const response = await fetch(`${FINDESK_BASE_URL}/leads`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

// Create Organisation
export async function createOrganisation(data: OrgData) {
  const response = await fetch(`${FINDESK_BASE_URL}/organisations`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

// Create Person
export async function createPerson(data: PersonData) {
  const response = await fetch(`${FINDESK_BASE_URL}/people`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

// Create Application
export async function createApplication(data: AppData) {
  const response = await fetch(`${FINDESK_BASE_URL}/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}

// Update Application Status
export async function updateApplicationStatus(id: string, status: string) {
  const response = await fetch(`${FINDESK_BASE_URL}/applications/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status }),
  });
  return response.json();
}
```

#### Step 2: Create API Routes
```
src/app/api/crm/
  sync/route.ts          # Manual sync trigger
  webhook/route.ts       # Receive CRM updates
```

#### Step 3: Add to Application Submission
In `src/app/api/applications/submit/route.ts`:
```typescript
import { createOrganisation, createPerson, createApplication } from '@/lib/findesk';

// After saving to database, sync to CRM
const org = await createOrganisation({
  name: application.businessName,
  abn: application.abn,
  // ... other fields
});

const person = await createPerson({
  firstName: application.applicantFirstName,
  lastName: application.applicantLastName,
  email: application.applicantEmail,
  phone: application.applicantPhone,
});

const crmApp = await createApplication({
  organisationId: org.id,
  personId: person.id,
  financeAmount: application.loanAmount,
  // ... other fields
});

// Log sync result
await query(`
  INSERT INTO crm_sync_log (application_id, sync_direction, status, crm_record_id)
  VALUES ($1, 'to_crm', 'success', $2)
`, [applicationId, crmApp.id]);
```

### Next Actions
- [ ] Get Findesk API credentials
- [ ] Create `src/lib/findesk.ts` service layer
- [ ] Create API routes
- [ ] Add sync to application submission
- [ ] Test with real Findesk account
- [ ] Set up webhook handler
- [ ] Add error handling and retry logic

---

## 🎯 Implementation Priority Order

### Phase 1: API Credentials (Immediate)
**Goal:** Get all API credentials configured

1. **Resend** - Create account, get API key
2. **ABN Lookup** - Register for GUID (2-3 day wait)
3. **Cloudflare R2** - Create account, set up bucket
4. **Dropbox Sign** - Create account, get API key
5. **Findesk CRM** - Get credentials from account manager

### Phase 2: Connect APIs (This Week)
**Goal:** Wire up all existing code to real APIs

1. Configure all environment variables
2. Test each integration individually
3. Test complete end-to-end flow

### Phase 3: Build New Integrations (Next Week)
**Goal:** Build bankstatements.com.au and Findesk CRM

1. **Findesk CRM**
   - Build service layer
   - Build API routes
   - Integrate with submission flow
   - Test sync

2. **bankstatements.com.au**
   - Research API
   - Build integration
   - Add UI components
   - Test with banks

---

## 🔧 Environment Variables Checklist

```env
# Database (Railway)
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:5000

# ABN Lookup
ABN_LOOKUP_GUID=your-guid-here

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@matrixfinance.com.au
USE_MOCK_EMAIL=false

# Document Storage (Cloudflare R2)
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=matrix-finance-docs

# E-Signatures (Dropbox Sign)
DROPBOX_SIGN_API_KEY=your-api-key-here
DROPBOX_SIGN_TEMPLATE_ID=your-template-id

# CRM (Findesk)
FINDESK_API_URL=https://app.findesk.com.au/api/v1
FINDESK_BEARER_TOKEN=your-bearer-token
FINDESK_ENTERPRISE_ID=your-enterprise-id

# Bank Statements
BANKSTATEMENTS_API_KEY=your-api-key
BANKSTATEMENTS_API_URL=https://api.bankstatements.com.au
```

---

## 🧪 Testing Strategy

### Local Development
```env
USE_MOCK_EMAIL=true
USE_MOCK_ABN=true
USE_MOCK_R2=true
USE_MOCK_ESIGN=true
```

### Staging Environment
Test with real APIs using test/sandbox credentials

### Production Environment
All real integrations with production credentials

---

## 📊 Success Criteria

### MVP Ready Checklist
- [ ] User can complete entire application flow
- [ ] Emails are sent successfully (Resend)
- [ ] ABN lookup returns real data
- [ ] Documents upload to Cloudflare R2
- [ ] E-signature works end-to-end (Dropbox Sign)
- [ ] Bank statements can be fetched (bankstatements.com.au)
- [ ] Application syncs to Findesk CRM
- [ ] Application saves to database
- [ ] Error handling works
- [ ] User sees success confirmation

---

## 📞 Support & Resources

### API Support Contacts
- **ABR:** https://abr.business.gov.au/Help/Contact
- **Resend:** support@resend.com
- **Cloudflare:** https://support.cloudflare.com
- **Dropbox Sign:** support@hellosign.com
- **bankstatements.com.au:** TBD
- **Findesk:** Account manager

### Documentation Links
- [ABR Web Services](https://abr.business.gov.au/Tools/WebServices)
- [Resend Docs](https://resend.com/docs)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Dropbox Sign API](https://developers.hellosign.com/)
- [Findesk API](https://app.findesk.com.au/api/v1) (requires auth)

---

**Next Review Date:** February 15, 2026
**Document Owner:** Development Team
**Status:** In Progress
