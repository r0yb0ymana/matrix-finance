/**
 * Review & Sign Screen
 * Final step - Review application and proceed to signing
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/contexts/ApplicationContext";

const PRODUCT_LABELS: Record<string, string> = {
  chattel_mortgage: 'Chattel Mortgage',
  rental_lease: 'Rental Lease',
};

export default function ReviewPage() {
  const router = useRouter();
  const { state, updateState } = useApplication();

  // Declaration checkboxes
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeCreditCheck, setAgreeCreditCheck] = useState(false);
  const [agreeDeclaration, setAgreeDeclaration] = useState(false);
  const [processing, setProcessing] = useState(false);

  const allAgreed = agreePrivacy && agreeCreditCheck && agreeDeclaration;

  const [submitError, setSubmitError] = useState("");

  const handleProceedToSigning = async () => {
    if (!allAgreed) return;

    setProcessing(true);
    setSubmitError("");

    try {
      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abn: state.abn,
          tradingName: state.tradingName,
          businessName: state.businessName,
          entityType: state.entityType || 'sole_trader',
          businessAddress: state.businessAddress ? {
            street: state.businessAddress.line1,
            city: state.businessAddress.suburb,
            state: state.businessAddress.state,
            postcode: state.businessAddress.postcode,
          } : undefined,
          applicantFirstName: state.applicantFirstName,
          applicantLastName: state.applicantLastName,
          applicantEmail: state.applicantEmail,
          applicantPhone: state.applicantPhone,
          applicantDateOfBirth: state.applicantDateOfBirth,
          residentialAddress: state.registeredAddress ? {
            street: state.registeredAddress.line1,
            city: state.registeredAddress.suburb,
            state: state.registeredAddress.state,
            postcode: state.registeredAddress.postcode,
          } : undefined,
          assets: state.assets ? {
            homeValue: state.assets.homeValue,
            investmentPropertyValue: state.assets.investmentProperty,
            cashAtBank: state.assets.cashAtBank,
            vehiclesValue: state.assets.vehicles,
            homeContentsValue: state.assets.homeContents,
            investmentsSharesValue: state.assets.investmentsShares,
            otherAssetsValue: state.assets.otherAssets,
          } : undefined,
          liabilities: state.liabilities,
          financeProduct: state.financeProduct,
          invoiceAmount: state.invoiceAmount,
          termMonths: state.termMonths,
          monthlyPayment: state.monthlyPayment,
          annualRate: state.annualRate,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Submission failed');
      }

      updateState({
        applicationId: data.data.applicationId,
        applicationNumber: data.data.applicationNumber,
      });

      router.push("/application/sign");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application');
      setProcessing(false);
    }
  };

  // Get product info from state or use defaults
  const productName = PRODUCT_LABELS[state.financeProduct || ''] || "Chattel Mortgage";
  const loanAmount = state.invoiceAmount || 50000;
  const monthlyPayment = state.monthlyPayment || 0;

  // Calculate financial position
  const totalAssets = (
    (state.assets?.homeValue || 0) +
    (state.assets?.investmentProperty || 0) +
    (state.assets?.cashAtBank || 0) +
    (state.assets?.vehicles || 0) +
    (state.assets?.homeContents || 0) +
    (state.assets?.investmentsShares || 0) +
    (state.assets?.otherAssets || 0)
  );

  const totalLiabilities = (
    (state.liabilities?.mortgageHome || 0) +
    (state.liabilities?.mortgageInvestment || 0) +
    (state.liabilities?.vehicleLoan || 0) +
    (state.liabilities?.creditCards || 0) +
    (state.liabilities?.otherLiabilities || 0)
  );

  const netEquity = totalAssets - totalLiabilities;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AppLayout 
      title="Review & Sign" 
      subtitle="Review your application"
      currentStep={7} 
      totalSteps={7}
    >
      <div className="space-y-4">
        {/* Application Summary Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #E5E7EB',
          padding: '1.25rem',
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '1rem',
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
          }}>
            Application Summary
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Product:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                {productName}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Cost:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                ${loanAmount.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Monthly:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3B82F6', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                ${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #E5E7EB', margin: '0.5rem 0' }} />

            {/* Financial Position */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Total Assets:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                {formatCurrency(totalAssets)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Total Liabilities:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                {formatCurrency(totalLiabilities)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Net Equity:
              </span>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: netEquity >= 0 ? '#16A34A' : '#DC2626',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif' 
              }}>
                {formatCurrency(netEquity)}
              </span>
            </div>
          </div>
        </div>

        {/* Required Declarations Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          border: '1px solid #E5E7EB',
          padding: '1.25rem',
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '1rem',
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
          }}>
            Required Declarations
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Declaration 1 */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginTop: '0.125rem',
                  accentColor: '#1a365d',
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#374151',
                lineHeight: '1.5',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                I have read and agree to the Privacy Policy and Terms & Conditions.
              </span>
            </label>

            {/* Declaration 2 */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreeCreditCheck}
                onChange={(e) => setAgreeCreditCheck(e.target.checked)}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginTop: '0.125rem',
                  accentColor: '#1a365d',
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#374151',
                lineHeight: '1.5',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                I authorise Matrix Equipment Finance to conduct necessary credit checks.
              </span>
            </label>

            {/* Declaration 3 */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreeDeclaration}
                onChange={(e) => setAgreeDeclaration(e.target.checked)}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  marginTop: '0.125rem',
                  accentColor: '#1a365d',
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#374151',
                lineHeight: '1.5',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                I declare the information I have provided is true and correct.
              </span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '0.5rem',
            color: '#DC2626',
            fontSize: '0.875rem',
          }}>
            {submitError}
          </div>
        )}

        {/* Proceed to Signing Button */}
        <Button
          onClick={handleProceedToSigning}
          disabled={!allAgreed || processing}
          fullWidth
          size="lg"
          style={{
            backgroundColor: allAgreed ? '#1a365d' : '#94a3b8',
            cursor: allAgreed ? 'pointer' : 'not-allowed',
          }}
        >
          {processing ? "Processing..." : "Proceed to Signing"}
        </Button>

        {/* Note */}
        <p style={{
          fontSize: '0.8125rem',
          color: '#6B7280',
          textAlign: 'center',
          fontFamily: 'var(--font-poppins), Poppins, sans-serif',
        }}>
          You will be redirected to secure signing to complete your application.
        </p>
      </div>
    </AppLayout>
  );
}
