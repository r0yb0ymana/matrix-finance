"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ProgressSteps,
  StepIndicator,
  Checkbox,
  FileUpload,
} from "@/components/ui";

const applicationSteps = [
  { id: "business", label: "Business" },
  { id: "applicant", label: "Applicant" },
  { id: "assets", label: "Assets" },
  { id: "liabilities", label: "Liabilities" },
  { id: "documents", label: "Documents" },
  { id: "review", label: "Review" },
  { id: "sign", label: "Sign" },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(4); // Documents step
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="screen-container">
      {/* Header */}
      <header className="app-header">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary-900">
              Matrix Equipment Finance
            </h1>
            <span className="text-sm text-gray-500">Sole Trader Application</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-gray-200 bg-white py-4">
        <div className="mx-auto max-w-6xl px-4">
          <ProgressSteps steps={applicationSteps} currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <StepIndicator
              currentStep={currentStep}
              totalSteps={applicationSteps.length}
              label="Identity Documents"
            />
            <CardTitle className="mt-3">Upload Identity Documents</CardTitle>
            <CardDescription>
              Please upload the following documents to verify your identity.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FileUpload
              label="Driver's Licence (Front)"
              required
              accept=".jpg,.jpeg,.png,.pdf"
              maxSize={10}
              hint="Upload a clear photo or scan of the front of your driver's licence"
            />

            <FileUpload
              label="Driver's Licence (Back)"
              required
              accept=".jpg,.jpeg,.png,.pdf"
              maxSize={10}
              hint="Upload a clear photo or scan of the back of your driver's licence"
            />

            <FileUpload
              label="Medicare Card"
              required
              accept=".jpg,.jpeg,.png,.pdf"
              maxSize={10}
              hint="Upload a clear photo or scan of your Medicare card"
            />

            {/* Info Panel */}
            <div className="info-panel">
              <h4 className="font-medium text-gray-900 mb-2">
                Document Requirements
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• All documents must be clear and legible</li>
                <li>• Accepted formats: JPG, PNG, PDF (max 10MB each)</li>
                <li>• Documents must be current and valid</li>
              </ul>
            </div>

            {/* Confirmation */}
            <Checkbox
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              label="I confirm that all uploaded documents are genuine and belong to me"
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
              disabled={!confirmed}
            >
              Continue
            </Button>
          </CardFooter>
        </Card>

        {/* Design System Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Design System Preview</CardTitle>
            <CardDescription>
              Components built with Matrix Finance brand guidelines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Buttons */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Buttons</h4>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
                <Button loading>Loading</Button>
              </div>
            </div>

            {/* Inputs */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Inputs</h4>
              <div className="space-y-4">
                <Input label="Email Address" type="email" placeholder="you@example.com" required />
                <Input label="ABN" placeholder="XX XXX XXX XXX" hint="Your 11-digit Australian Business Number" />
                <Input label="Amount" type="number" placeholder="0.00" error="Please enter a valid amount" />
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Brand Colors</h4>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-primary-900" />
                  <span className="mt-1 text-xs text-gray-500">Primary</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-accent-100 border border-gray-200" />
                  <span className="mt-1 text-xs text-gray-500">Accent</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-success" />
                  <span className="mt-1 text-xs text-gray-500">Success</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-warning" />
                  <span className="mt-1 text-xs text-gray-500">Warning</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 rounded-lg bg-error" />
                  <span className="mt-1 text-xs text-gray-500">Error</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2026 Matrix Equipment Finance. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
