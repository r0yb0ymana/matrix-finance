/**
 * Financial Position - Liabilities Screen
 *
 * Step 6 of Application Flow
 * Liability declaration for financial position assessment
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApplication } from "@/contexts/ApplicationContext";

// Label style matching Assets page
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '0.25rem',
  fontFamily: 'var(--font-poppins), Poppins, sans-serif',
};

export default function FinancialPositionLiabilitiesPage() {
  const router = useRouter();
  const { state, updateState, markStepComplete } = useApplication();

  // Form state - matching Roy's field names
  const [mortgageHome, setMortgageHome] = useState(
    state.liabilities?.mortgageHome?.toString() || ""
  );
  const [mortgageInvestment, setMortgageInvestment] = useState(
    state.liabilities?.mortgageInvestment?.toString() || ""
  );
  const [vehicleLoan, setVehicleLoan] = useState(
    state.liabilities?.vehicleLoan?.toString() || ""
  );
  const [creditCards, setCreditCards] = useState(
    state.liabilities?.creditCards?.toString() || ""
  );
  const [otherLiabilities, setOtherLiabilities] = useState(
    state.liabilities?.otherLiabilities?.toString() || ""
  );
  const [confirmed, setConfirmed] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const parseAmount = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    return cleaned ? parseFloat(cleaned) : 0;
  };

  const formatDisplayValue = (value: string): string => {
    const amount = parseAmount(value);
    return amount > 0 ? amount.toLocaleString() : "";
  };

  const handleAmountChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setter(cleaned);
  };

  const handleBlur = (
    value: string,
    setter: (value: string) => void
  ) => {
    const formatted = formatDisplayValue(value);
    setter(formatted);
  };

  const handleFocus = (
    value: string,
    setter: (value: string) => void
  ) => {
    const cleaned = value.replace(/,/g, "");
    setter(cleaned);
  };

  const calculateTotalAssets = (): number => {
    return (
      (state.assets?.homeValue || 0) +
      (state.assets?.investmentProperty || 0) +
      (state.assets?.cashAtBank || 0) +
      (state.assets?.vehicles || 0) +
      (state.assets?.homeContents || 0) +
      (state.assets?.investmentsShares || 0) +
      (state.assets?.otherAssets || 0)
    );
  };

  const calculateTotalLiabilities = (): number => {
    return (
      parseAmount(mortgageHome) +
      parseAmount(mortgageInvestment) +
      parseAmount(vehicleLoan) +
      parseAmount(creditCards) +
      parseAmount(otherLiabilities)
    );
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCalculate = () => {
    // Format all values
    setMortgageHome(formatDisplayValue(mortgageHome));
    setMortgageInvestment(formatDisplayValue(mortgageInvestment));
    setVehicleLoan(formatDisplayValue(vehicleLoan));
    setCreditCards(formatDisplayValue(creditCards));
    setOtherLiabilities(formatDisplayValue(otherLiabilities));
    // Show the summary
    setShowSummary(true);
  };

  const handleContinue = () => {
    updateState({
      liabilities: {
        mortgageHome: parseAmount(mortgageHome),
        mortgageInvestment: parseAmount(mortgageInvestment),
        vehicleLoan: parseAmount(vehicleLoan),
        creditCards: parseAmount(creditCards),
        otherLiabilities: parseAmount(otherLiabilities),
      },
    });

    markStepComplete(6);
    router.push("/application/documents");
  };

  return (
    <AppLayout
      title="Liabilities"
      subtitle="Enter your liability values"
      currentStep={6}
      totalSteps={8}
    >
      <div className="space-y-4">
        {/* Liability Fields */}
        <div>
          <label style={labelStyle}>Mortgage Home ($)</label>
          <Input
            type="text"
            value={mortgageHome}
            onChange={(e) => handleAmountChange(e.target.value, setMortgageHome)}
            onBlur={() => handleBlur(mortgageHome, setMortgageHome)}
            onFocus={() => handleFocus(mortgageHome, setMortgageHome)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={labelStyle}>Mortgage Investment ($)</label>
          <Input
            type="text"
            value={mortgageInvestment}
            onChange={(e) => handleAmountChange(e.target.value, setMortgageInvestment)}
            onBlur={() => handleBlur(mortgageInvestment, setMortgageInvestment)}
            onFocus={() => handleFocus(mortgageInvestment, setMortgageInvestment)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={labelStyle}>Vehicle Loan ($)</label>
          <Input
            type="text"
            value={vehicleLoan}
            onChange={(e) => handleAmountChange(e.target.value, setVehicleLoan)}
            onBlur={() => handleBlur(vehicleLoan, setVehicleLoan)}
            onFocus={() => handleFocus(vehicleLoan, setVehicleLoan)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={labelStyle}>Credit Cards ($)</label>
          <Input
            type="text"
            value={creditCards}
            onChange={(e) => handleAmountChange(e.target.value, setCreditCards)}
            onBlur={() => handleBlur(creditCards, setCreditCards)}
            onFocus={() => handleFocus(creditCards, setCreditCards)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={labelStyle}>Other Liabilities ($)</label>
          <Input
            type="text"
            value={otherLiabilities}
            onChange={(e) => handleAmountChange(e.target.value, setOtherLiabilities)}
            onBlur={() => handleBlur(otherLiabilities, setOtherLiabilities)}
            onFocus={() => handleFocus(otherLiabilities, setOtherLiabilities)}
            placeholder="0"
          />
        </div>

        {/* Calculate Button */}
        <Button
          onClick={handleCalculate}
          fullWidth
          size="lg"
        >
          Calculate
        </Button>

        {/* Summary Panel - shown after Calculate */}
        {showSummary && (
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#374151', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Total Assets:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                {formatCurrency(calculateTotalAssets())}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#374151', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Total Liabilities:
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                {formatCurrency(calculateTotalLiabilities())}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                Net Equity:
              </span>
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: (calculateTotalAssets() - calculateTotalLiabilities()) >= 0 ? '#16A34A' : '#DC2626',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif' 
              }}>
                {formatCurrency(calculateTotalAssets() - calculateTotalLiabilities())}
              </span>
            </div>
          </div>
        )}

        {/* Confirmation Checkbox */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem 0' }}>
          <input
            type="checkbox"
            id="confirm"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{
              width: '1.25rem',
              height: '1.25rem',
              marginTop: '0.125rem',
              accentColor: '#1a365d',
              cursor: 'pointer',
            }}
          />
          <label
            htmlFor="confirm"
            style={{
              fontSize: '0.875rem',
              color: '#374151',
              lineHeight: '1.5',
              cursor: 'pointer',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            }}
          >
            I confirm my financial position details above are true and correct.
          </label>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          fullWidth
          size="lg"
          disabled={!confirmed}
          style={{
            backgroundColor: confirmed ? '#1a365d' : '#94a3b8',
            cursor: confirmed ? 'pointer' : 'not-allowed',
          }}
        >
          Continue
        </Button>
      </div>
    </AppLayout>
  );
}
