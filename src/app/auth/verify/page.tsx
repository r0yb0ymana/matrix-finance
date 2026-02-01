/**
 * Auth Verify Page
 *
 * Verifies magic link and handles OTP input
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  OTPInputField,
} from "@/components/ui";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"verifying" | "otp" | "error">("verifying");
  const [email, setEmail] = useState("");
  const [applicationId, setApplicationId] = useState<string>();
  const [otp, setOTP] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Verify magic link on mount
  useEffect(() => {
    if (!token) {
      setError("Invalid login link");
      setStep("error");
      return;
    }

    verifyMagicLink();
  }, [token]);

  const verifyMagicLink = async () => {
    try {
      const response = await fetch(`/api/auth/verify-link?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify link");
      }

      setEmail(data.email);
      setApplicationId(data.application_id);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setStep("error");
    }
  };

  const handleOTPComplete = async (code: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          application_id: applicationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid code");
      }

      // Redirect to application or dashboard
      if (applicationId) {
        router.push(`/application/${applicationId}`);
      } else {
        router.push("/application/new");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
      setOTP(""); // Clear OTP input
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError("");

    try {
      const response = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  // Verifying magic link
  if (step === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-100 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-error-light rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-error"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <CardTitle>Link Invalid or Expired</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              Request New Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // OTP input
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-primary-900">
              Matrix Equipment Finance
            </h1>
          </div>
          <CardTitle>Enter Verification Code</CardTitle>
          <CardDescription>
            We sent a 4-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <OTPInputField
            value={otp}
            onChange={setOTP}
            onComplete={handleOTPComplete}
            disabled={loading}
            error={!!error}
            errorMessage={error}
            hint="Enter the code from your email"
          />

          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-900 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Verifying...</p>
            </div>
          )}

          {resendSuccess && (
            <div className="p-3 bg-success-light border border-success rounded-lg">
              <p className="text-sm text-success-dark text-center">
                New code sent! Check your email.
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <Button
              variant="ghost"
              onClick={handleResendCode}
              disabled={resendLoading}
              loading={resendLoading}
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-accent-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
