/**
 * Finance Calculator Page
 *
 * Interactive calculator for equipment finance
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Slider,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { formatCurrency } from "@/lib/financial";
import { useApplication } from "@/contexts/ApplicationContext";
import { AppLayout } from "@/components/layout";

const EQUIPMENT_CATEGORIES = [
  "Cardio Machines",
  "Strength Equipment",
  "Free Weight Accessories",
  "Other",
];

export default function CalculatorPage() {
  const router = useRouter();
  const { updateState } = useApplication();

  // Form state
  const [financeType, setFinanceType] = useState<string>("chattel_mortgage");
  const [equipmentCategories, setEquipmentCategories] = useState<string[]>([]);
  const [equipmentCost, setEquipmentCost] = useState([50000]);
  const [termMonths, setTermMonths] = useState([36]);

  // Calculation results
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");

  // Calculate payment whenever inputs change
  useEffect(() => {
    calculatePayment();
  }, [equipmentCost[0], termMonths[0]]);

  const calculatePayment = async () => {
    setCalculating(true);
    setError("");

    try {
      const response = await fetch("/api/calculator/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceAmount: equipmentCost[0],
          termMonths: termMonths[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Calculation failed");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setCalculating(false);
    }
  };

  const toggleCategory = (category: string) => {
    setEquipmentCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const termOptions = [
    { value: 24, label: "24 months (2 years)" },
    { value: 36, label: "36 months (3 years)" },
    { value: 48, label: "48 months (4 years)" },
    { value: 60, label: "60 months (5 years)" },
  ];

  return (
    <AppLayout>
      <div className="bg-accent-100 min-h-[calc(100vh-180px)] py-8">
        <div className="mx-auto max-w-4xl px-4">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-brand-navy">
              Finance Calculator
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Calculate your equipment finance repayments
            </p>
          </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Calculator Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Finance Details</CardTitle>
              <CardDescription>
                Customize your finance requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Finance Type */}
              <Select value={financeType} onValueChange={setFinanceType}>
                <SelectTrigger label="Finance Type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chattel_mortgage">Chattel Mortgage</SelectItem>
                  <SelectItem value="rental_lease">Rental Lease</SelectItem>
                </SelectContent>
              </Select>

              {/* Equipment Categories */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Equipment Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                        equipmentCategories.includes(category)
                          ? "border-brand-navy bg-brand-navy text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-brand-navy-light"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Cost Slider */}
              <Slider
                label="Equipment Cost"
                value={equipmentCost}
                onValueChange={setEquipmentCost}
                min={10000}
                max={500000}
                step={1000}
                formatValue={(value) => formatCurrency(value)}
              />

              {/* Term Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Loan Term
                  </label>
                  <span className="text-sm font-semibold text-brand-navy">
                    {termMonths[0]} months
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {termOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTermMonths([option.value])}
                      className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                        termMonths[0] === option.value
                          ? "border-brand-navy bg-brand-navy text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-brand-navy-light"
                      }`}
                    >
                      {option.value}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-error-light border border-error rounded-lg">
                  <p className="text-sm text-error-dark">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculation Results */}
          <Card>
            <CardHeader>
              <CardTitle>Your Repayment Estimate</CardTitle>
              <CardDescription>
                Based on your finance requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {calculating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
                </div>
              ) : result ? (
                <>
                  {/* Monthly Payment */}
                  <div className="p-6 bg-accent-100 rounded-lg border-2 border-brand-navy">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Monthly Repayment
                    </p>
                    <p className="text-4xl font-bold text-brand-navy">
                      {formatCurrency(result.monthlyPayment)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Payable in advance
                    </p>
                  </div>

                  {/* Finance Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Equipment Cost</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(result.invoiceAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Application Fee</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(result.applicationFee)}
                      </span>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount Financed</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(result.amountFinanced)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Interest Rate (p.a.)</span>
                      <span className="font-semibold text-gray-900">
                        {(result.annualRate * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Loan Term</span>
                      <span className="font-semibold text-gray-900">
                        {result.termMonths} months
                      </span>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Payable</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(result.totalPayable)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Interest</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(result.totalInterest)}
                      </span>
                    </div>
                  </div>

                  {/* Rate Band Info */}
                  {result.rateBand && (
                    <div className="info-panel">
                      <p className="text-xs text-gray-600">
                        <strong>Rate Band:</strong> {formatCurrency(result.rateBand.min_amount)} - {formatCurrency(result.rateBand.max_amount)}
                        <br />
                        Your equipment cost falls within this range, qualifying for{" "}
                        {(result.rateBand.annual_rate * 100).toFixed(2)}% p.a.
                      </p>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      // Save calculator results to application state
                      updateState({
                        financeProduct: financeType as 'chattel_mortgage' | 'rental_lease',
                        invoiceAmount: equipmentCost[0],
                        termMonths: termMonths[0],
                        monthlyPayment: result.monthlyPayment,
                        annualRate: result.annualRate,
                      });
                      // Navigate to application
                      router.push("/application/business-lookup");
                    }}
                  >
                    Apply Now
                  </Button>
                </>
              ) : (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <p>Adjust the sliders to see your repayment estimate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Important:</strong> This calculator provides an estimate only. The final interest rate and repayment amount may vary based on your credit assessment and the specific equipment being financed. Application fee of ${result?.applicationFee || 495} applies. All repayments are payable in advance (beginning of each month). Loan terms from 24 to 60 months available. Minimum loan amount $10,000, maximum $500,000.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
