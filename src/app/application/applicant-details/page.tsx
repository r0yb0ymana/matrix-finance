/**
 * Personal Information Screen (Shared Screen 5)
 * Step 4 of 7 - Applicant personal and address details
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

const RESIDENCY_STATUS = [
  { value: "own", label: "Own" },
  { value: "rent", label: "Rent" },
  { value: "board", label: "Board" },
  { value: "other", label: "Other" },
];

export default function PersonalInformationPage() {
  const router = useRouter();
  const { state, updateState, markStepComplete } = useApplication();

  // Redirect if no business details
  useEffect(() => {
    if (!state.abnLookupResult || !state.businessName) {
      router.push("/application/business-lookup");
    }
  }, [state.abnLookupResult, state.businessName, router]);

  // Form state - some prefilled
  const [fullName, setFullName] = useState(state.applicantFirstName && state.applicantLastName
    ? `${state.applicantFirstName} ${state.applicantLastName}`
    : "John Smith"
  );
  const [email, setEmail] = useState(state.applicantEmail || "john.smith@example.com");
  const [dateOfBirth, setDateOfBirth] = useState(state.applicantDateOfBirth || "1985-06-15");
  const [homeStreetAddress, setHomeStreetAddress] = useState(state.homeAddress?.line1 || "");
  const [city, setCity] = useState(state.homeAddress?.suburb || "");
  const [stateValue, setStateValue] = useState(state.homeAddress?.state || "");
  const [postcode, setPostcode] = useState(state.homeAddress?.postcode || "");
  const [residencyStatus, setResidencyStatus] = useState(state.residencyStatus || "");
  const [confirmed, setConfirmed] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Valid email is required";
    }
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!homeStreetAddress.trim()) {
      newErrors.homeStreetAddress = "Home street address is required";
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
    if (!residencyStatus) {
      newErrors.residencyStatus = "Residency status is required";
    }
    if (!confirmed) {
      newErrors.confirmed = "Please confirm your details";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) {
      return;
    }

    // Parse full name
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    // Save to context
    updateState({
      applicantFirstName: firstName,
      applicantLastName: lastName,
      applicantEmail: email,
      applicantDateOfBirth: dateOfBirth,
      homeAddress: {
        line1: homeStreetAddress,
        line2: "",
        suburb: city,
        state: stateValue,
        postcode,
      },
      residencyStatus,
    });

    // Mark step complete
    markStepComplete(4);

    // Navigate to assets
    router.push("/application/financial-position-assets");
  };

  if (!state.abnLookupResult) {
    return null;
  }

  return (
    <AppLayout
      title="Personal Information"
      currentStep={4}
      totalSteps={8}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Full Name - Prefilled */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Full Name*
            </label>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
              Prefilled
            </span>
          </div>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            placeholder="John Smith"
          />
        </div>

        {/* Email - Prefilled */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Email*
            </label>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
              Prefilled
            </span>
          </div>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="john.smith@example.com"
          />
        </div>

        {/* Date of Birth - Prefilled */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth*
            </label>
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
              Prefilled
            </span>
          </div>
          <Input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            error={errors.dateOfBirth}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Home Street Address */}
        <div className="space-y-2">
          <Input
            label="Home Street Address*"
            type="text"
            value={homeStreetAddress}
            onChange={(e) => setHomeStreetAddress(e.target.value)}
            error={errors.homeStreetAddress}
            placeholder="45 Home St"
          />
        </div>

        {/* City, State, Postcode - Grid layout */}
        <div className="grid grid-cols-3 gap-4">
          {/* City */}
          <div className="space-y-2">
            <Input
              label="City*"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              placeholder="Sydney"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              State*
            </label>
            <Select value={stateValue} onValueChange={setStateValue}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
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

          {/* Postcode */}
          <div className="space-y-2">
            <Input
              label="Postcode*"
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))}
              error={errors.postcode}
              placeholder="2000"
              maxLength={4}
            />
          </div>
        </div>

        {/* Residency Status */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Residency Status*
          </label>
          <Select value={residencyStatus} onValueChange={setResidencyStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {RESIDENCY_STATUS.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.residencyStatus && (
            <p className="text-sm text-error">{errors.residencyStatus}</p>
          )}
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Checkbox
            id="confirm-applicant"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          />
          <label
            htmlFor="confirm-applicant"
            className="text-sm text-gray-700 cursor-pointer leading-relaxed"
          >
            I confirm my applicant details provided above are true and correct.
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

