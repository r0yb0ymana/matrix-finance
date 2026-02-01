/**
 * Business Lookup Screen (Shared Screen 3)
 * Step 2 of 8 - ABN input and business verification
 * Matches Figma design EXACTLY
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/contexts/ApplicationContext";
import { isValidABNFormat, isValidABNChecksum, formatABN } from "@/lib/abn-lookup";
import type { ABNLookupResult } from "@/lib/abn-lookup";

export default function BusinessLookupPage() {
  const router = useRouter();
  const { state, updateState, markStepComplete } = useApplication();

  const [abn, setABN] = useState(state.abn || "");
  const [abnError, setABNError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleABNChange = (value: string) => {
    const cleaned = value.replace(/[^\d\s]/g, "");
    setABN(cleaned);
    setABNError("");
  };

  const handleLookup = async () => {
    setABNError("");
    setLoading(true);

    try {
      const cleanedABN = abn.replace(/\s/g, "");

      if (!isValidABNFormat(cleanedABN)) {
        setABNError("Invalid ABN format. ABN must be 11 digits.");
        setLoading(false);
        return;
      }

      if (!isValidABNChecksum(cleanedABN)) {
        setABNError("Invalid ABN. Please check the number and try again.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/abn/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abn: cleanedABN }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to lookup ABN");
      }

      const lookupResult: ABNLookupResult = data.data;

      updateState({
        abn: formatABN(cleanedABN),
        abnLookupResult: lookupResult,
        businessName: lookupResult.entityName,
        tradingName: lookupResult.tradingNames?.[0] || lookupResult.entityName,
      });

      markStepComplete(2);
      router.push("/application/business-confirmation");
    } catch (error) {
      setABNError(error instanceof Error ? error.message : "Failed to lookup ABN");
    } finally {
      setLoading(false);
    }
  };

  // Styles matching Figma exactly - Inter font for body, Poppins for headings
  const fontInter = 'var(--font-inter), Inter, sans-serif';
  
  const styles = {
    instructionText: {
      color: '#6B7280',
      fontSize: '0.938rem',
      marginBottom: '1.5rem',
      fontFamily: fontInter,
    } as React.CSSProperties,
    
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '0.5rem',
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
      boxSizing: 'border-box', // Prevents overflow
    } as React.CSSProperties,
    
    helpText: {
      fontSize: '0.813rem',
      color: '#9CA3AF',
      marginTop: '0.5rem',
      fontFamily: fontInter,
    } as React.CSSProperties,
    
    infoBox: {
      backgroundColor: '#F0F5FF',
      borderRadius: '0.5rem',
      padding: '1rem 1.25rem',
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
    } as React.CSSProperties,
    
    infoHeading: {
      color: '#1E3A5F',
      fontSize: '0.938rem',
      fontWeight: 500,
      marginBottom: '0.75rem',
      fontFamily: fontInter,
    } as React.CSSProperties,
    
    infoList: {
      margin: 0,
      paddingLeft: '1.25rem',
      color: '#4B5563',
      fontSize: '0.875rem',
      lineHeight: 1.7,
      fontFamily: fontInter,
    } as React.CSSProperties,
    
    errorText: {
      color: '#EF4444',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
      fontFamily: fontInter,
    } as React.CSSProperties,
  };

  return (
    <AppLayout title="Business Lookup" currentStep={2} totalSteps={8}>
      {/* Instruction */}
      <p style={styles.instructionText}>
        Enter your ABN to retrieve these details.
      </p>

      {/* ABN Input Field */}
      <div>
        <label style={styles.label}>
          Australian Business Number (ABN)*
        </label>
        <input
          type="text"
          placeholder="XX XXX XXX XXX"
          value={abn}
          onChange={(e) => handleABNChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && abn.replace(/\s/g, "").length === 11) {
              handleLookup();
            }
          }}
          disabled={loading}
          maxLength={14}
          style={{
            ...styles.input,
            borderColor: abnError ? '#EF4444' : '#E5E7EB',
          }}
        />
        {abnError ? (
          <p style={styles.errorText}>{abnError}</p>
        ) : (
          <p style={styles.helpText}>Enter your 11-digit ABN.</p>
        )}
      </div>

      {/* Info Panel */}
      <div style={styles.infoBox}>
        <p style={styles.infoHeading}>What we&apos;ll retrieve:</p>
        <ul style={styles.infoList}>
          <li>Business name and entity type</li>
          <li>ABN status</li>
          <li>GST registration details</li>
        </ul>
      </div>

      {/* Lookup Button */}
      <Button
        onClick={handleLookup}
        disabled={loading || abn.replace(/\s/g, "").length !== 11}
        fullWidth
        size="lg"
        loading={loading}
      >
        {loading ? "Looking up..." : "Lookup ABN"}
      </Button>
    </AppLayout>
  );
}
