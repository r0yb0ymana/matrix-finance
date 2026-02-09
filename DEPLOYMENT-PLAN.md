# Matrix Finance — Deployment Plan

**Created:** 2026-02-09
**Status:** Pre-deployment checklist

---

## 📋 Overview

This plan covers everything needed to take Matrix Finance from local development to production deployment.

**Current State:**
- ✅ Database schema complete
- ✅ 16 application pages built (full Sole Trader flow)
- ✅ 22 API routes created
- ✅ API credentials configured (mock/test mode)
- ⚠️ Local database needs setup
- ⚠️ End-to-end flow not yet tested

---

## 🎯 Pre-Deployment Checklist

### Phase 1: Local Database Setup ⬜
**Time estimate: 30 min**

- [ ] Start PostgreSQL locally (or via Docker)
- [ ] Create database: `matrix_finance`
- [ ] Update `.env.local` with correct password
- [ ] Run schema: `psql -d matrix_finance -f database/schema.sql`
- [ ] Verify: `npm run db:status`
- [ ] Verify: `curl http://localhost:5000/api/health`

**Docker option:**
```bash
docker-compose up -d postgres
```

### Phase 2: Test Authentication Flow ⬜
**Time estimate: 30 min**

- [ ] Go to `/login`
- [ ] Enter test email
- [ ] Check magic link/OTP is generated (mock mode logs to console)
- [ ] Complete verification at `/auth/verify`
- [ ] Confirm session is created
- [ ] Test logout

**API endpoints to test:**
- POST `/api/auth/request-link`
- POST `/api/auth/verify-otp`
- GET `/api/auth/session`
- POST `/api/auth/logout`

### Phase 3: Test Calculator ⬜
**Time estimate: 15 min**

- [ ] Go to `/calculator`
- [ ] Test Payment Calculator (enter loan amount → get payment)
- [ ] Test Rate Calculator (enter payment → get rate)
- [ ] Test Loan Amount Calculator (enter payment → get max loan)
- [ ] Verify calculations are correct

**API endpoints to test:**
- POST `/api/calculator/payment`
- POST `/api/calculator/rate`
- POST `/api/calculator/loan-amount`

### Phase 4: Test Sole Trader Application Flow ⬜
**Time estimate: 1-2 hours**

Complete the entire 8-step flow:

| Step | Page | What to Test |
|------|------|--------------|
| 1 | `/application/product-selection` | Select finance product |
| 2 | `/application/business-lookup` | Enter ABN, verify lookup works |
| 3 | `/application/business-confirmation` | Review ABN data |
| 4 | `/application/trading-information` | Enter trading info |
| 5 | `/application/business-details` | Enter business details |
| 6 | `/application/applicant-details` | Enter personal info |
| 7 | `/application/financial-position-assets` | Enter assets |
| 8 | `/application/financial-position-liabilities` | Enter liabilities |
| 9 | `/application/documents` | Upload ID documents |
| 10 | `/application/business-documents` | Upload bank statements |
| 11 | `/application/review` | Review all data |
| 12 | `/application/sign` | E-signature |
| 13 | `/application/submitted` | Confirmation |

**Key tests:**
- [ ] ABN Lookup returns real data (needs valid GUID)
- [ ] Data persists between steps
- [ ] Validation works on all fields
- [ ] File upload works (mock mode saves locally)
- [ ] E-signature flow works (mock mode)
- [ ] Application saves to database
- [ ] CRM sync triggers (mock mode logs)

### Phase 5: Fix Bugs ⬜
**Time estimate: Variable**

Document any issues found during testing:

| Bug | Severity | Status |
|-----|----------|--------|
| (to be filled during testing) | | |

### Phase 6: Production Environment Setup ⬜
**Time estimate: 1 hour**

Choose platform: **Railway** or **Render**

**Railway (Recommended):**
- [ ] Create Railway project
- [ ] Add PostgreSQL database
- [ ] Add web service (connect GitHub repo)
- [ ] Configure environment variables
- [ ] Set build command: `npm run build`
- [ ] Set start command: `npm run start`

**Render (Alternative):**
- [ ] Create Render web service
- [ ] Add PostgreSQL database
- [ ] Connect GitHub repo
- [ ] Configure environment variables

### Phase 7: Production Environment Variables ⬜
**Time estimate: 30 min**

Configure these in production:

```env
# Database (from Railway/Render)
DATABASE_URL=postgresql://user:pass@host:5432/matrix_finance

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# ABN Lookup (REQUIRED - get from ABR)
ABR_GUID=your-production-guid

# Email (REQUIRED - Resend)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@matrixfinance.com.au

# Document Storage (REQUIRED - Cloudflare R2)
CLOUDFLARE_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=matrix-finance-docs

# E-Signatures (REQUIRED - Dropbox Sign)
DROPBOX_SIGN_API_KEY=xxxxx
DROPBOX_SIGN_TEMPLATE_ID=xxxxx

# CRM (REQUIRED - Findesk)
FINDESK_API_URL=https://app.findesk.com.au/api/v1
FINDESK_BEARER_TOKEN=xxxxx
FINDESK_ENTERPRISE_ID=xxxxx

# Bank Statements (OPTIONAL for MVP)
BANKSTATEMENTS_API_KEY=xxxxx
```

### Phase 8: Production Database Setup ⬜
**Time estimate: 15 min**

- [ ] Run schema on production database
- [ ] Seed rate bands and loan terms
- [ ] Create initial admin user (if needed)
- [ ] Verify health check passes

### Phase 9: Domain & DNS ⬜
**Time estimate: 30 min**

- [ ] Choose domain (e.g., apply.matrixfinance.com.au)
- [ ] Configure DNS to point to Railway/Render
- [ ] Enable HTTPS (automatic on both platforms)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain

### Phase 10: Final Production Testing ⬜
**Time estimate: 1 hour**

- [ ] Complete full application flow on production
- [ ] Test real emails (Resend)
- [ ] Test real ABN lookups
- [ ] Test document uploads to R2
- [ ] Test e-signature flow
- [ ] Test CRM sync
- [ ] Check error handling
- [ ] Check mobile responsiveness

---

## 📊 API Credentials Status

| Service | Purpose | Status | Action Needed |
|---------|---------|--------|---------------|
| ABN Lookup | Business verification | ✅ GUID configured | Verify it's production-ready |
| Resend | Email (magic links, OTP) | ✅ Key configured | Verify domain is verified |
| Cloudflare R2 | Document storage | ✅ Keys configured | Create production bucket |
| Dropbox Sign | E-signatures | ✅ Key configured | Upload contract template |
| Findesk CRM | CRM sync | ✅ Key configured | Test with real account |
| bankstatements.com.au | Bank data | ⚠️ Optional | Can skip for MVP |

---

## 🚀 Deployment Commands

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

**Render:**
- Connect GitHub repo via Render dashboard
- Auto-deploys on push to main

---

## ⏱️ Time Estimate Summary

| Phase | Time |
|-------|------|
| Local Database Setup | 30 min |
| Test Auth Flow | 30 min |
| Test Calculator | 15 min |
| Test Application Flow | 1-2 hours |
| Fix Bugs | Variable |
| Production Setup | 1 hour |
| Environment Variables | 30 min |
| Production Database | 15 min |
| Domain & DNS | 30 min |
| Final Testing | 1 hour |
| **Total** | **5-6 hours** |

---

## ✅ Go-Live Checklist

Before announcing go-live:

- [ ] All application steps work end-to-end
- [ ] Emails deliver successfully
- [ ] Documents upload and are accessible
- [ ] E-signatures complete without errors
- [ ] CRM receives application data
- [ ] Health check returns 200 OK
- [ ] Error monitoring is in place
- [ ] Backup strategy confirmed (Railway/Render handle this)

---

**Ready to start?** Begin with Phase 1: Local Database Setup.
