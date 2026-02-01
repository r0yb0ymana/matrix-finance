# Matrix Equipment Finance - Complete Design Specification

> Extracted from Figma Design System on 2026-01-31
> Source: Design System for Matrix Equipment Finance

---

## BRAND GUIDELINES

### Colors
- **Primary Navy:** `#1E2C5E`
- **Accent Light Blue:** `#F5F8FC`
- **Support:** Dark + Light mode variants

### Typography
- **Headings:** Poppins
- **Body:** Inter
- **Scale:** 32/24/18/16/14px

### Design Principles
- Rounded buttons
- Clean spacing, mobile-first
- Consistent component library
- Platforms: Desktop, iOS, Android

---

## FLOW OVERVIEW

| Flow | Screens | Complexity |
|------|---------|------------|
| Sole Trader (ST) | 8 screens | 43 fields |
| Company (CF) | 14 screens | ~60+ fields |
| Trust Individual (TFI) | 9 screens | Similar to ST |
| Trust Company (TFC) | 11 screens | 81 fields (most complex) |
| Shared Components | 7 screens | Reused across flows |
| E-Sign & Confirmation | 5 screens | Shared |
| Staff Dashboard | 2 screens | Admin only |

### Color Coding
- **Yellow** = Shared Components
- **Purple** = Applicant Flows
- **Blue** = Staff & System
- **Grey** = Archive

---

## SHARED COMPONENTS (7 Screens)

### Screen 1: Login + OTP
- Email Address* (email input)
- reCAPTCHA (component)
- 4-digit OTP code (OTP input)
- Resend code (button/link)

### Screen 1B: Invite Expired
- Request new invite (button)
- Support phone number display

### Screen 2: Product Calculator
- Finance Amount* ($10,000 - $500,000 slider + input)
- Repayment Term* (12-84 months dropdown)
- Repayment Frequency* (Weekly/Fortnightly/Monthly radio)
- Calculated values display:
  - Total Repayments
  - Interest Rate
  - Comparison Rate

### Screen 3: ABN Lookup
- ABN* (11-digit input with validation)
- Lookup button
- Entity details display card

### Screen 3B: Business Confirmation
- Pre-filled business details (read-only):
  - ABN
  - Entity Type
  - Business Name
  - ABN Status
  - GST Registration
- Confirmation checkbox*

### Screen 4: Business Details
- Trading Name (optional)
- Business Start Date*
- Industry Type* (dropdown)
- Business Address:
  - Street Address*
  - City/Suburb*
  - State* (dropdown: NSW, VIC, QLD, SA, WA, TAS, NT, ACT)
  - Postcode* (4-digit)

### Screen 5: Applicant Personal Details
- First Name*
- Middle Name (optional)
- Last Name*
- Date of Birth* (DD/MM/YYYY)
- Email Address*
- Mobile Number* (Australian format)

### Screen 6: Assets (Shared Component)
**7 Asset Fields:**
- Home Value ($)
- Investment Property ($)
- Cash at Bank ($)
- Vehicles ($)
- Home Contents ($)
- Investments/Shares ($)
- Other Assets ($)

### Screen 6B: Liabilities (Shared Component)
**5 Liability Fields:**
- Mortgage – Home ($)
- Mortgage – Investment ($)
- Vehicle Loan ($)
- Credit Cards ($)
- Other Liabilities ($)

**Calculated Summary:**
- Total Assets
- Total Liabilities
- **Net Equity**
- Confirmation checkbox*

### Screen 7: Identity Documents
**3 Required Uploads:**
- Driver's Licence (Front)*
- Driver's Licence (Back)*
- Medicare Card*

Document Requirements Panel showing accepted formats.

### Screen 7B: Business Documents
- Bank Statements (PDF upload)
- OR "Retrieve Bank Statement Link" button
- Trust Deed (only for TFC flow)

### Screen 8: Review & Sign
**3 Shared Declarations (checkboxes):**
1. I confirm all information is true and correct
2. I consent to credit checks and information verification
3. I agree to the Terms & Conditions and Privacy Policy

- Application Summary Card
- "Proceed to Signing" button → E-Sign Redirect

---

## SOLE TRADER FLOW (ST) - 8 Screens

### ST-01: Login
- Same as Shared Screen 1

### ST-02: ABN Lookup
- Same as Shared Screen 3

### ST-03: Business Confirmation
- Same as Shared Screen 3B
- Entity type should show "Sole Trader"

### ST-04: Personal Details
- Same as Shared Screen 5
- Plus residential address:
  - Street Address*
  - City/Suburb*
  - State*
  - Postcode*
  - Residential Status* (Own/Rent/Board/Other)
  - Years at Address*
  - Months at Address*

### ST-05: Assets
- Same as Shared Screen 6

### ST-06: Liabilities
- Same as Shared Screen 6B
- Include Calculate button + Net Equity display

### ST-07: Documents
**Identity (3 uploads):**
- Driver's Licence Front*
- Driver's Licence Back*
- Medicare Card*

**Business (1 upload OR link):**
- Bank Statements (PDF) OR External Bank Link

### ST-08: Review & Sign
- 3 shared declarations
- Application summary
- Proceed to Signing button

---

## COMPANY FLOW (CF) - 14 Screens

### CF-01: Login
Same as Shared

### CF-02: ABN Lookup
Same as Shared

### CF-03: Company Confirmation
- Pre-filled company details from ABN lookup
- Confirmation checkbox*

### CF-04: Director 1 - FULL Details
**Personal:**
- First Name*
- Middle Name
- Last Name*
- Date of Birth*
- Email*
- Mobile*

**Residential:**
- Street Address*
- City/Suburb*
- State*
- Postcode*
- Residential Status*
- Years at Address*
- Months at Address*

### CF-05: Director 2 - Contact Only
- First Name*
- Last Name*
- Email*
- Mobile*
- Date of Birth*

### CF-06: Director 3 - Contact Only
Same as CF-05

### CF-07: Director 4 - Contact Only
Same as CF-05

### CF-08: Assets
Same as Shared Screen 6

### CF-09: Liabilities
Same as Shared Screen 6B

### CF-10: Identity Documents
**Director 1 ONLY uploads:**
- Driver's Licence Front*
- Driver's Licence Back*
- Medicare Card*

(Directors 2-4 have NO upload fields)

### CF-11: Business Documents
- Bank Statements (PDF) OR External Bank Link

### CF-12: Review & Sign
- 3 shared declarations
- "Proceed to Signing" → E-Sign Redirect

### CF-13: Submission Confirmation
- Success icon
- Reference Number
- "What Happens Next?" section
- Start New Application button
- Logout button

---

## TRUST INDIVIDUAL FLOW (TFI) - 9 Screens

### TFI-01: Trust Entity Confirmation
- ABN (pre-filled)
- Entity Type: Trust
- Trust Name
- ABN Status
- GST Registration
- **Trustee Type Selector:** Individual / Company
- Confirmation checkbox*

### TFI-02: Trustee Type Selection (Individual)
- Trustee Personal Details:
  - First Name*
  - Last Name*
  - Date of Birth*
  - Email*
  - Mobile*
- Note: "Multiple trustees require staff review"

### TFI-03: Trustee Personal Details
- Street Address*
- City/Suburb*
- State*
- Postcode*
- Residential Status*
- Years at Address*
- Months at Address*
- Mobile*

### TFI-04: Assets
Same as Shared

### TFI-05: Liabilities
Same as Shared (with Calculate + Net Equity + Confirm)

### TFI-06: Identity Documents
**Trustee uploads:**
- Driver's Licence Front*
- Driver's Licence Back*
- Medicare Card*

### TFI-07: Business Documents
- Bank Statements (PDF) OR External Bank Link
- **NO Trust Deed** for Individual Trustee

### TFI-08: Review & Sign
- 3 shared declarations
- E-Sign Redirect

### TFI-09: Submission Confirmation
Same as CF-13

---

## TRUST COMPANY FLOW (TFC) - 11 Screens

### TFC-01: Trust Entity Confirmation
Same as TFI-01, but selecting "Company" as Trustee Type

### TFC-02: Trustee Company ABN Lookup
- Trustee Company ABN*
- Lookup button

### TFC-03: Trustee Company Confirmation
- Pre-filled trustee company details
- Confirmation checkbox*

### TFC-04: Trustee Company Details
- Trading Name
- Business Start Date*
- Industry Type*
- Business Address fields

### TFC-05: Director Tabs
- Autogenerated tabs for directors
- **Director 1: Full details**
- **Directors 2-3: Minimal (contact only)**

### TFC-06: Director 1 - Personal Details
Same as CF-04

### TFC-07: Assets
Same as Shared

### TFC-07b: Liabilities
Same as Shared (note: uses "b" suffix)

### TFC-08: Identity Documents
**Director 1 ONLY uploads:**
- Driver's Licence Front*
- Driver's Licence Back*
- Medicare Card*

(Directors 2-3 have no upload fields)

### TFC-09: Business Documents
- Bank Statements (PDF) OR External Bank Link
- **REQUIRED: Trust Deed upload**

### TFC-10: Review & Sign
- 3 shared declarations
- E-Sign Redirect

### TFC-11: Submission Confirmation
Same as CF-13

---

## E-SIGN & CONFIRMATION (5 Screens)

### E-Sign Redirect
- Redirecting message
- DocuSign/E-Sign integration point

### E-Sign In Progress
- Progress indicator
- Document signing status

### E-Sign Complete
- Success message
- Return to application

### Submission Processing
- Processing animation
- Status updates

### Final Confirmation
- Reference number
- Next steps
- Support contact

---

## VALIDATION RULES

### Field Validations
- **ABN:** 11 digits, checksum validation
- **Email:** Standard email format
- **Mobile:** Australian format (04xx xxx xxx)
- **Postcode:** 4 digits
- **Date of Birth:** DD/MM/YYYY, must be 18+
- **Currency fields:** Numeric, $0 - $99,999,999

### Flow Rules
- **Company Directors:** D1 full details, D2-D4 contact only
- **TFI Trustee:** Single trustee, no Trust Deed
- **TFC Trustee:** Company with directors, Trust Deed REQUIRED
- **Document Uploads:** D1 only for CF/TFC flows

### Business Rules
- All applicant flows share same 12 financial fields (7 assets + 5 liabilities)
- File uploads: 3-4 documents required depending on flow
- Checkboxes increase with complexity (6 for ST → 15 for TFC)
- ABN lookups: 1 for most flows, 2 for Trust Company Trustee

---

## 7-STAGE MODEL

All flows follow this structure:
1. **Login** - Authentication
2. **Product** - Finance calculator
3. **Business/Trust** - Entity setup
4. **Applicants/Directors** - Personal details
5. **Assets** - Financial position (assets)
6. **Liabilities** - Financial position (liabilities + net equity)
7. **Documents** - Identity + Business documents
8. **Review & Sign** - Declaration + E-Sign
9. **Submission** - Confirmation

---

## COMPONENT PATTERNS

### Buttons
- **Primary:** Navy background (#1E2C5E), white text, rounded corners
- **Secondary:** Light blue background, navy text
- **Disabled:** Greyed out until validation passes

### Input Fields
- Label above field
- Placeholder text
- Error state: Red border + error message below
- Required indicator: asterisk (*)

### Cards
- White background
- Subtle shadow
- Rounded corners
- Padding: 16-24px

### Document Upload
- Drag-and-drop zone
- File type icons
- Progress indicator
- Success/error states

---

## SCREENSHOTS REFERENCE

Screenshots saved to: `C:\dev\matrix-finance-designs\`
- 00-overview-shared-components.png
- 01-shared-login-invite.png
- (Additional screenshots to be captured)

---

*Generated by Atlas from Figma Design System*
*Last updated: 2026-01-31*
