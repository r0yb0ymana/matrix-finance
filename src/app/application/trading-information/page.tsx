/**
 * Trading Information Screen (Step 3 of 7)
 * Business address and contact details
 * Matches Figma design exactly
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/contexts/ApplicationContext";

export default function TradingInformationPage() {
  const router = useRouter();
  const { state, updateState, markStepComplete } = useApplication();

  // Fonts
  const fontInter = 'var(--font-inter), Inter, sans-serif';

  // Form state - prefilled from ABN lookup
  const [streetAddress, setStreetAddress] = useState(state.businessAddress?.street || "Level 5, 123 Business Street");
  const [city, setCity] = useState(state.businessAddress?.city || "Sydney");
  const [stateValue, setStateValue] = useState(state.businessAddress?.state || "NSW");
  const [postcode, setPostcode] = useState(state.businessAddress?.postcode || "2000");
  const [mobile, setMobile] = useState(state.applicantMobile || "");
  const [confirmed, setConfirmed] = useState(false);

  // Redirect if no ABN lookup (disabled for preview)
  // useEffect(() => {
  //   if (!state.abnLookupResult) {
  //     router.push("/application/business-lookup");
  //   }
  // }, [state.abnLookupResult, router]);

  const handleContinue = () => {
    if (!confirmed) return;
    
    updateState({
      businessAddress: {
        street: streetAddress,
        city: city,
        state: stateValue,
        postcode: postcode,
      },
      applicantMobile: mobile,
    });
    
    markStepComplete(3);
    router.push("/application/applicant-details");
  };

  // Styles
  const styles = {
    sectionTitle: {
      fontSize: '0.938rem',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '1rem',
      fontFamily: fontInter,
    } as React.CSSProperties,

    fieldGroup: {
      marginBottom: '1rem',
    } as React.CSSProperties,

    labelRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    } as React.CSSProperties,

    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
      fontFamily: fontInter,
    } as React.CSSProperties,

    prefillBadge: {
      fontSize: '0.75rem',
      color: '#3B82F6',
      backgroundColor: '#EFF6FF',
      padding: '0.125rem 0.5rem',
      borderRadius: '0.25rem',
      fontFamily: fontInter,
    } as React.CSSProperties,

    input: {
      width: '100%',
      height: '2.75rem',
      padding: '0 1rem',
      fontSize: '1rem',
      color: '#111827',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      outline: 'none',
      backgroundColor: 'white',
      fontFamily: fontInter,
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    inputPrefilled: {
      width: '100%',
      height: '2.75rem',
      padding: '0 1rem',
      fontSize: '1rem',
      color: '#111827',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      outline: 'none',
      backgroundColor: '#F9FAFB',
      fontFamily: fontInter,
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,

    select: {
      width: '100%',
      height: '2.75rem',
      padding: '0 1rem',
      fontSize: '1rem',
      color: '#111827',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      outline: 'none',
      backgroundColor: '#F9FAFB',
      fontFamily: fontInter,
      boxSizing: 'border-box' as const,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      cursor: 'pointer',
    } as React.CSSProperties,

    row3Col: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '0.75rem',
    } as React.CSSProperties,

    checkboxContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: '#F9FAFB',
      borderRadius: '0.5rem',
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
    } as React.CSSProperties,

    checkbox: {
      width: '1.25rem',
      height: '1.25rem',
      marginTop: '0.125rem',
      accentColor: '#1a365d',
      cursor: 'pointer',
    } as React.CSSProperties,

    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#374151',
      lineHeight: 1.5,
      fontFamily: fontInter,
      cursor: 'pointer',
    } as React.CSSProperties,
  };

  const states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

  return (
    <AppLayout title="Trading Information" currentStep={3} totalSteps={8}>
      <div>
        {/* Trading Address Section */}
        <h2 style={styles.sectionTitle}>Trading Address</h2>

        {/* Street Address */}
        <div style={styles.fieldGroup}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Street Address*</label>
            <span style={styles.prefillBadge}>Prefilled</span>
          </div>
          <input
            type="text"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            style={styles.inputPrefilled}
          />
        </div>

        {/* City, State, Postcode Row */}
        <div style={styles.row3Col}>
          <div>
            <div style={styles.labelRow}>
              <label style={styles.label}>City*</label>
              <span style={styles.prefillBadge}>Prefilled</span>
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={styles.inputPrefilled}
            />
          </div>

          <div>
            <div style={styles.labelRow}>
              <label style={styles.label}>State*</label>
              <span style={styles.prefillBadge}>Prefilled</span>
            </div>
            <select
              value={stateValue}
              onChange={(e) => setStateValue(e.target.value)}
              style={styles.select}
            >
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <div style={styles.labelRow}>
              <label style={styles.label}>Postcode</label>
              <span style={styles.prefillBadge}>Prefilled</span>
            </div>
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              maxLength={4}
              style={styles.inputPrefilled}
            />
          </div>
        </div>

        {/* Mobile */}
        <div style={{ ...styles.fieldGroup, marginTop: '1rem' }}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Mobile #*</label>
          </div>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="0412 345 678"
            style={styles.input}
          />
        </div>

        {/* Confirmation Checkbox */}
        <div style={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="confirm"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={styles.checkbox}
          />
          <label htmlFor="confirm" style={styles.checkboxLabel}>
            I confirm my business details provided above are true and correct.
          </label>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!confirmed || !mobile}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </div>
    </AppLayout>
  );
}
