/**
 * Financial Position - Assets Screen
 *
 * Step 5 of Sole Trader Application Flow
 * Asset declaration for financial position assessment
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApplication } from "@/contexts/ApplicationContext";

export default function FinancialPositionAssetsPage() {
  const router = useRouter();
  const { state, updateState, markStepComplete } = useApplication();

  // Redirect if previous steps incomplete (disabled for testing)
  // useEffect(() => {
  //   if (!state.applicantFirstName || !state.applicantEmail) {
  //     router.push("/application/business-lookup");
  //   }
  // }, [state.applicantFirstName, state.applicantEmail, router]);

  // Form state
  const [homeValue, setHomeValue] = useState(
    state.assets?.homeValue?.toString() || ""
  );
  const [investmentProperty, setInvestmentProperty] = useState(
    state.assets?.investmentProperty?.toString() || ""
  );
  const [cashAtBank, setCashAtBank] = useState(
    state.assets?.cashAtBank?.toString() || ""
  );
  const [vehicles, setVehicles] = useState(
    state.assets?.vehicles?.toString() || ""
  );
  const [homeContents, setHomeContents] = useState(
    state.assets?.homeContents?.toString() || ""
  );
  const [investmentsShares, setInvestmentsShares] = useState(
    state.assets?.investmentsShares?.toString() || ""
  );
  const [otherAssets, setOtherAssets] = useState(
    state.assets?.otherAssets?.toString() || ""
  );

  const parseAmount = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    return cleaned ? parseFloat(cleaned) : 0;
  };

  // Format number with commas for display
  const formatDisplayValue = (value: string): string => {
    const amount = parseAmount(value);
    return amount > 0 ? amount.toLocaleString() : "";
  };

  const handleAmountChange = (
    value: string,
    setter: (value: string) => void
  ) => {
    // Allow only numbers and decimal point
    const cleaned = value.replace(/[^0-9.]/g, "");
    setter(cleaned);
  };

  // Format on blur - add commas
  const handleBlur = (
    value: string,
    setter: (value: string) => void
  ) => {
    const formatted = formatDisplayValue(value);
    setter(formatted);
  };

  // Remove formatting on focus
  const handleFocus = (
    value: string,
    setter: (value: string) => void
  ) => {
    const cleaned = value.replace(/,/g, "");
    setter(cleaned);
  };

  const handleContinue = () => {
    // Save to context
    updateState({
      assets: {
        homeValue: parseAmount(homeValue),
        investmentProperty: parseAmount(investmentProperty),
        cashAtBank: parseAmount(cashAtBank),
        vehicles: parseAmount(vehicles),
        homeContents: parseAmount(homeContents),
        investmentsShares: parseAmount(investmentsShares),
        otherAssets: parseAmount(otherAssets),
      },
    });

    // Mark step complete
    markStepComplete(5);

    // Navigate to liabilities
    router.push("/application/financial-position-liabilities");
  };

  // if (!state.applicantFirstName) {
  //   return null;
  // }

  return (
    <AppLayout
      title="Assets"
      subtitle="Enter your asset values"
      currentStep={5}
      totalSteps={8}
    >
      <div className="space-y-4">
        {/* Asset Fields */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            Home Value ($)
          </label>
          <Input
            type="text"
            value={homeValue}
            onChange={(e) => handleAmountChange(e.target.value, setHomeValue)}
            onBlur={() => handleBlur(homeValue, setHomeValue)}
            onFocus={() => handleFocus(homeValue, setHomeValue)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            Investment Property Value ($)
          </label>
          <Input
            type="text"
            value={investmentProperty}
            onChange={(e) => handleAmountChange(e.target.value, setInvestmentProperty)}
            onBlur={() => handleBlur(investmentProperty, setInvestmentProperty)}
            onFocus={() => handleFocus(investmentProperty, setInvestmentProperty)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            Cash at Bank ($)
          </label>
          <Input
            type="text"
            value={cashAtBank}
            onChange={(e) => handleAmountChange(e.target.value, setCashAtBank)}
            onBlur={() => handleBlur(cashAtBank, setCashAtBank)}
            onFocus={() => handleFocus(cashAtBank, setCashAtBank)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            Vehicles ($)
          </label>
          <Input
            type="text"
            value={vehicles}
            onChange={(e) => handleAmountChange(e.target.value, setVehicles)}
            onBlur={() => handleBlur(vehicles, setVehicles)}
            onFocus={() => handleFocus(vehicles, setVehicles)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            Home Contents ($)
          </label>
          <Input
            type="text"
            value={homeContents}
            onChange={(e) => handleAmountChange(e.target.value, setHomeContents)}
            onBlur={() => handleBlur(homeContents, setHomeContents)}
            onFocus={() => handleFocus(homeContents, setHomeContents)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            Investments/Shares ($)
          </label>
          <Input
            type="text"
            value={investmentsShares}
            onChange={(e) => handleAmountChange(e.target.value, setInvestmentsShares)}
            onBlur={() => handleBlur(investmentsShares, setInvestmentsShares)}
            onFocus={() => handleFocus(investmentsShares, setInvestmentsShares)}
            placeholder="0"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
            Other Assets ($)
          </label>
          <Input
            type="text"
            value={otherAssets}
            onChange={(e) => handleAmountChange(e.target.value, setOtherAssets)}
            onBlur={() => handleBlur(otherAssets, setOtherAssets)}
            onFocus={() => handleFocus(otherAssets, setOtherAssets)}
            placeholder="0"
          />
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
