/**
 * Application Success Screen
 *
 * Confirmation page after successful application submission
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "@/components/ui";
import { useApplication } from "@/contexts/ApplicationContext";

export default function SuccessPage() {
  const router = useRouter();
  const { state, resetState } = useApplication();

  useEffect(() => {
    if (!state.applicationId) {
      router.push("/application/business-lookup");
    }
  }, [state.applicationId, router]);

  const handleNewApplication = () => {
    resetState();
    router.push("/application/business-lookup");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  if (!state.applicationId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-accent-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold text-primary-900">
            Matrix Equipment Finance
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-900">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Application Submitted Successfully!</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for applying with Matrix Equipment Finance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Application ID */}
            <div className="p-4 bg-accent-100 rounded-lg border-2 border-primary-900">
              <p className="text-xs text-gray-600 uppercase font-medium text-center">
                Application Reference
              </p>
              <p className="text-xl font-bold text-primary-900 text-center mt-1">
                {state.applicationId}
              </p>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-900 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Application Review
                    </p>
                    <p className="text-sm text-gray-600">
                      Our team will review your application and verify the information
                      provided.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-900 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Document Collection
                    </p>
                    <p className="text-sm text-gray-600">
                      We may contact you to request additional documentation or
                      clarification.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-900 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Decision</p>
                    <p className="text-sm text-gray-600">
                      You'll receive a decision within 48 hours. If approved, we'll send
                      documents for e-signature.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-900 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Equipment Delivery</p>
                    <p className="text-sm text-gray-600">
                      Once documents are signed, we'll arrange settlement and equipment
                      delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-900 font-semibold mb-2">
                Need to speak with us?
              </p>
              <p className="text-sm text-gray-600">
                Email:{" "}
                <a
                  href="mailto:applications@matrixfinance.com.au"
                  className="text-primary-900 underline"
                >
                  applications@matrixfinance.com.au
                </a>
                <br />
                Phone:{" "}
                <a href="tel:1300123456" className="text-primary-900 underline">
                  1300 123 456
                </a>
              </p>
            </div>

            {/* Email Confirmation */}
            <div className="p-4 bg-accent-100 rounded-lg border border-gray-300">
              <p className="text-sm text-gray-900">
                <strong>Confirmation email sent</strong>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                We've sent a confirmation email to{" "}
                <strong>{state.applicantEmail}</strong> with your application details
                and reference number.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleNewApplication} className="flex-1">
                New Application
              </Button>
              <Button onClick={handleGoHome} className="flex-1">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

