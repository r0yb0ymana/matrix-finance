/**
 * Business Confirmation Screen (Shared Screen 3B)
 * Step 3 of 7 - Confirm ABN lookup results
 * Matches Figma design
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useApplication } from "@/contexts/ApplicationContext";
import { EntityType } from "@/types/database.types";

const ENTITY_TYPE_MAP: Record<string, EntityType> = {
  "Sole Trader": EntityType.SOLE_TRADER,
  "Company": EntityType.COMPANY,
  "Partnership": EntityType.PARTNERSHIP,
  "Trust": EntityType.TRUST_INDIVIDUAL_TRUSTEE,
};

export default function BusinessConfirmationPage() {
  const router = useRouter();
  const { state, updateState, markStepComplete } = useApplication();

  const [confirmed, setConfirmed] = useState(false);
  const [entityType, setEntityType] = useState(
    state.abnLookupResult?.entityType || "Sole Trader"
  );

  const abnResult = state.abnLookupResult;

  const handleContinue = () => {
    if (!confirmed) return;

    updateState({
      entityType: ENTITY_TYPE_MAP[entityType] || EntityType.SOLE_TRADER,
    });

    markStepComplete(3);

    // Navigate to trading information
    router.push("/application/trading-information");
  };

  if (!abnResult) {
    router.push("/application/business-lookup");
    return null;
  }

  return (
    <AppLayout title="Business Confirmation" currentStep={3} totalSteps={8}>
      <div className="space-y-6">
        {/* Instructions */}
        <p className="text-gray-700">
          Details retrieved, please review and confirm.
        </p>

        {/* ABN Details - Read-only fields with "Prefilled" badge */}
        <div className="space-y-4">
          {/* Australian Business Number (ABN) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Australian Business Number (ABN)
              </label>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                Prefilled
              </span>
            </div>
            <div className="h-11 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 flex items-center">
              {abnResult.abn}
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                Prefilled
              </span>
            </div>
            <div className="h-11 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 flex items-center">
              {abnResult.entityName}
            </div>
          </div>

          {/* Entity Type - Editable dropdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Entity Type
              </label>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                Prefilled
              </span>
            </div>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sole Trader">Sole Trader</SelectItem>
                <SelectItem value="Company">Company</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
                <SelectItem value="Trust">Trust</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                Prefilled
              </span>
            </div>
            <div className="h-11 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg flex items-center">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-900 font-medium">Active</span>
              </span>
            </div>
          </div>

          {/* GST Registration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                GST Registration
              </label>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                Prefilled
              </span>
            </div>
            <div className="h-11 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 flex items-center">
              {abnResult.gstRegistered ? "Yes" : "No"}
            </div>
          </div>

          {/* GST Registration Date */}
          {abnResult.gstRegistered && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  GST Registration Date
                </label>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                  Prefilled
                </span>
              </div>
              <div className="h-11 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 flex items-center">
                {/* TODO: Get actual GST registration date from ABN lookup */}
                15 March 2020
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Checkbox
            id="confirm"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked as boolean)}
          />
          <label
            htmlFor="confirm"
            className="text-sm text-gray-700 cursor-pointer leading-relaxed"
          >
            I confirm my business details provided above are true and correct.
          </label>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!confirmed}
          fullWidth
          size="lg"
        >
          Confirm and Continue
        </Button>
      </div>
    </AppLayout>
  );
}

