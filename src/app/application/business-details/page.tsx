/**
 * Trading Information Screen (Shared Screen 4 - Business Details)
 * Step 3 of 7 - Trading address and contact details
 * Matches Figma design
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useApplication } from "@/contexts/ApplicationContext";

const AUSTRALIAN_STATES = [
  { value: "NSW", label: "NSW" },
  { value: "VIC", label: "VIC" },
  { value: "QLD", label: "QLD" },
  { value: "SA", label: "SA" },
  { value: "WA", label: "WA" },
  { value: "TAS", label: "TAS" },
  { value: "NT", label: "NT" },
  { value: "ACT", label: "ACT" },
];

export default function TradingInformationPage() {
  const router = useRouter();
  const { state, updateState, markStepComplete } = useApplication();

  // Redirect if no ABN lookup result
  useEffect(() => {
    if (!state.abnLookupResult) {
      router.push("/application/business-lookup");
    }
  }, [state.abnLookupResult, router]);

  // Form state - prefilled from ABN lookup if available
  const [streetAddress, setStreetAddress] = useState(
    state.businessAddress?.line1 || "Level 5, 123 Business Street"
  );
  const [city, setCity] = useState(state.businessAddress?.suburb || "Sydney");
  const [stateValue, setStateValue] = useState(state.businessAddress?.state || "NSW");
  const [postcode, setPostcode] = useState(state.businessAddress?.postcode || "2000");
  const [mobile, setMobile] = useState(state.applicantPhone || "");
  const [confirmed, setConfirmed] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
    }
    if (!stateValue) {
      newErrors.state = "State is required";
    }
    if (!postcode.trim() || !/^\d{4}$/.test(postcode)) {
      newErrors.postcode = "Valid 4-digit postcode is required";
    }
    if (!mobile.trim() || !/^04\d{2}\s?\d{3}\s?\d{3}$/.test(mobile.replace(/\s/g, ""))) {
      newErrors.mobile = "Valid Australian mobile number is required (04xx xxx xxx)";
    }
    if (!confirmed) {
      newErrors.confirmed = "Please confirm your business details";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      return;
    }

    // Save to context
    updateState({
      businessAddress: {
        line1: streetAddress,
        line2: "",
        suburb: city,
        state: stateValue,
        postcode: postcode,
      },
      applicantPhone: mobile,
    });

    // Mark step complete
    markStepComplete(3);

    // Navigate to applicant/personal details
    router.push("/application/applicant-details");
  };

  if (!state.abnLookupResult) {
    return null;
  }

  return (
    <AppLayout
      title="Trading Information"
      currentStep={3}
      totalSteps={8}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-lg font-heading font-semibold text-gray-900">
          Trading Address
        </h2>

        {/* Street Address - Prefilled */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Street Address*
            </label>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
              Prefilled
            </span>
          </div>
          <Input
            type="text"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            error={errors.streetAddress}
            placeholder="123 Main Street"
          />
        </div>

        {/* City, State, Postcode - Grid layout */}
        <div className="grid grid-cols-3 gap-4">
          {/* City - Prefilled */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                City*
              </label>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                Prefilled
              </span>
            </div>
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              placeholder="Sydney"
            />
          </div>

          {/* State - Prefilled */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                State*
              </label>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                Prefilled
              </span>
            </div>
            <Select value={stateValue} onValueChange={setStateValue}>
              <SelectTrigger label="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUSTRALIAN_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-sm text-error">{errors.state}</p>
            )}
          </div>

          {/* Postcode - Prefilled */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Postcode*
              </label>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                Prefilled
              </span>
            </div>
            <Input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))}
              error={errors.postcode}
              placeholder="2000"
              maxLength={4}
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Input
            label="Mobile #*"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            error={errors.mobile}
            placeholder="0412 345 678"
          />
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Checkbox
            id="confirm-business"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          />
          <label
            htmlFor="confirm-business"
            className="text-sm text-gray-700 cursor-pointer leading-relaxed"
          >
            I confirm my business details provided above are true and correct.
          </label>
        </div>
        {errors.confirmed && (
          <p className="text-sm text-error">{errors.confirmed}</p>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!confirmed}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </div>
    </AppLayout>
  );
}

