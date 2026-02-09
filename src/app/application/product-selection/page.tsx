/**
 * Product Selection Screen (Step 1 of 8)
 * Finance calculator with product type, equipment cost, and loan term
 * Matches Figma design exactly
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/contexts/ApplicationContext";

export default function ProductSelectionPage() {
  const router = useRouter();
  const { updateState, markStepComplete } = useApplication();

  // Fonts
  const fontInter = 'var(--font-inter), Inter, sans-serif';

  // Form state
  const [financeType, setFinanceType] = useState("");
  const [equipmentCategories, setEquipmentCategories] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [equipmentCost, setEquipmentCost] = useState(50000);
  const [loanTerm, setLoanTerm] = useState(48);
  const [monthlyPayment, setMonthlyPayment] = useState(1094);

  // Annual rate from API
  const [annualRate, setAnnualRate] = useState(0);

  // Calculate payment via API when inputs change
  useEffect(() => {
    const controller = new AbortController();
    const fetchPayment = async () => {
      try {
        const res = await fetch('/api/calculator/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceAmount: equipmentCost, termMonths: loanTerm }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success && data.data?.monthlyPayment) {
          setMonthlyPayment(Math.round(data.data.monthlyPayment));
          setAnnualRate(data.data.annualRate);
        }
      } catch {
        // Ignore abort errors
      }
    };
    fetchPayment();
    return () => controller.abort();
  }, [equipmentCost, loanTerm]);

  const handleContinue = () => {
    updateState({
      financeProduct: financeType as 'chattel_mortgage' | 'rental_lease',
      invoiceAmount: equipmentCost,
      termMonths: loanTerm,
      monthlyPayment: monthlyPayment,
      annualRate: annualRate,
    });
    markStepComplete(1);
    router.push("/application/business-lookup");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Styles
  const styles = {
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '0.5rem',
      fontFamily: fontInter,
    } as React.CSSProperties,

    select: {
      width: '100%',
      height: '2.75rem',
      padding: '0 1rem',
      fontSize: '1rem',
      color: '#6B7280',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      outline: 'none',
      backgroundColor: 'white',
      fontFamily: fontInter,
      boxSizing: 'border-box' as const,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      cursor: 'pointer',
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

    sliderContainer: {
      marginTop: '0.5rem',
    } as React.CSSProperties,

    slider: {
      width: '100%',
      height: '6px',
      borderRadius: '3px',
      background: `linear-gradient(to right, #1a365d 0%, #1a365d ${((equipmentCost - 10000) / (500000 - 10000)) * 100}%, #E5E7EB ${((equipmentCost - 10000) / (500000 - 10000)) * 100}%, #E5E7EB 100%)`,
      outline: 'none',
      appearance: 'none' as const,
      cursor: 'pointer',
    } as React.CSSProperties,

    sliderLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '0.5rem',
      fontSize: '0.75rem',
      color: '#6B7280',
      fontFamily: fontInter,
    } as React.CSSProperties,

    sliderValue: {
      textAlign: 'center' as const,
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a365d',
      marginTop: '0.25rem',
      fontFamily: fontInter,
    } as React.CSSProperties,

    termContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '0.5rem',
    } as React.CSSProperties,

    termLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      fontFamily: fontInter,
    } as React.CSSProperties,

    termLabelActive: {
      fontSize: '0.875rem',
      color: '#1a365d',
      fontWeight: 600,
      fontFamily: fontInter,
    } as React.CSSProperties,

    paymentCard: {
      backgroundColor: '#F0F5FF',
      borderRadius: '0.5rem',
      padding: '1.25rem',
      textAlign: 'center' as const,
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
    } as React.CSSProperties,

    paymentLabel: {
      fontSize: '0.875rem',
      color: '#6B7280',
      marginBottom: '0.25rem',
      fontFamily: fontInter,
    } as React.CSSProperties,

    paymentAmount: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1a365d',
      fontFamily: fontInter,
    } as React.CSSProperties,

    divider: {
      height: '1px',
      backgroundColor: '#E5E7EB',
      margin: '1.5rem 0',
    } as React.CSSProperties,
  };

  // Term slider calculation
  const termPositions = [24, 36, 48, 60];
  const termIndex = termPositions.indexOf(loanTerm);
  const termPercent = termIndex >= 0 ? (termIndex / (termPositions.length - 1)) * 100 : 66.67;

  return (
    <AppLayout title="Product Selection" currentStep={1} totalSteps={8}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Finance Type */}
        <div>
          <label style={styles.label}>Finance Type*</label>
          <select
            value={financeType}
            onChange={(e) => setFinanceType(e.target.value)}
            style={styles.select}
          >
            <option value="">Select product...</option>
            <option value="chattel_mortgage">Chattel Mortgage</option>
            <option value="rental_lease">Rental Lease</option>
          </select>
        </div>

        {/* Equipment Category - Multi-select checkboxes */}
        <div>
          <label style={styles.label}>Equipment Category*</label>
          <button
            type="button"
            onClick={() => setCategoryOpen(!categoryOpen)}
            style={{
              ...styles.select,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left' as const,
              color: equipmentCategories.length > 0 ? '#111827' : '#6B7280',
              backgroundImage: 'none', // Remove default arrow
            }}
          >
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {equipmentCategories.length > 0 ? equipmentCategories.join(', ') : 'Select category...'}
            </span>
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              style={{ 
                flexShrink: 0,
                transform: categoryOpen ? 'rotate(180deg)' : 'none', 
                transition: 'transform 0.2s',
                marginLeft: '0.5rem',
              }}
            >
              <path fill="#6B7280" d="M6 8L1 3h10z"/>
            </svg>
          </button>
          
          {categoryOpen && (
            <div style={{
              border: '1px solid #E5E7EB',
              borderTop: 'none',
              borderRadius: '0 0 0.5rem 0.5rem',
              backgroundColor: 'white',
            }}>
              {['Cardio Machines', 'Strength Equipment', 'Free Weight Accessories'].map((category) => (
                <label
                  key={category}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #F3F4F6',
                    fontFamily: fontInter,
                    fontSize: '0.938rem',
                    color: '#374151',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={equipmentCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEquipmentCategories([...equipmentCategories, category]);
                      } else {
                        setEquipmentCategories(equipmentCategories.filter(c => c !== category));
                      }
                    }}
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      accentColor: '#1a365d',
                    }}
                  />
                  {category}
                </label>
              ))}
            </div>
          )}
        </div>

        <div style={styles.divider} />

        {/* Equipment Cost Input */}
        <div>
          <label style={styles.label}>Equipment Cost *</label>
          <input
            type="text"
            value={`$ ${equipmentCost.toLocaleString()}`}
            onChange={(e) => {
              const value = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 10000;
              setEquipmentCost(Math.min(500000, Math.max(10000, value)));
            }}
            style={styles.input}
          />
        </div>

        {/* Equipment Cost Slider */}
        <div>
          <label style={styles.label}>Equipment Cost*</label>
          <div style={styles.sliderContainer}>
            <input
              type="range"
              min={10000}
              max={500000}
              step={1000}
              value={equipmentCost}
              onChange={(e) => setEquipmentCost(parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.sliderLabels}>
              <span>$10,000</span>
              <span style={{ fontWeight: 600, color: '#1a365d' }}>{formatCurrency(equipmentCost)}</span>
              <span>$500,000</span>
            </div>
          </div>
        </div>

        {/* Monthly Loan Term */}
        <div>
          <label style={styles.label}>Monthly Loan Term*</label>
          <div style={styles.sliderContainer}>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={termPositions.indexOf(loanTerm)}
              onChange={(e) => setLoanTerm(termPositions[parseInt(e.target.value)])}
              style={{
                ...styles.slider,
                background: `linear-gradient(to right, #1a365d 0%, #1a365d ${termPercent}%, #E5E7EB ${termPercent}%, #E5E7EB 100%)`,
              }}
            />
            <div style={styles.termContainer}>
              {termPositions.map((term) => (
                <span 
                  key={term}
                  style={term === loanTerm ? styles.termLabelActive : styles.termLabel}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Payment Card */}
        <div style={styles.paymentCard}>
          <p style={styles.paymentLabel}>Monthly Payment</p>
          <p style={styles.paymentAmount}>{formatCurrency(monthlyPayment)}</p>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </div>
    </AppLayout>
  );
}
