/**
 * E-Sign Redirect Screen
 * Redirects user to secure signing (HelloSign/DocuSign)
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Lock } from "lucide-react";
import { useApplication } from "@/contexts/ApplicationContext";

export default function SignPage() {
  const router = useRouter();
  const { state, updateState } = useApplication();
  const [dots, setDots] = useState("");
  const [error, setError] = useState("");

  // Animate the dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Call e-sign API and redirect
  useEffect(() => {
    const createSignatureRequest = async () => {
      try {
        const res = await fetch('/api/esign/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: state.applicationId || 'temp',
            signerName: `${state.applicantFirstName || 'Applicant'} ${state.applicantLastName || ''}`.trim(),
            signerEmail: state.applicantEmail || 'applicant@example.com',
          }),
        });

        const data = await res.json();

        if (data.success && data.data) {
          updateState({ signatureRequestId: data.data.signatureRequestId });
          // In production, would redirect to data.data.signUrl
          // For mock, navigate to submitted after a brief delay
          setTimeout(() => {
            router.push("/application/submitted");
          }, 2000);
        } else {
          setError(data.error || 'Failed to create signature request');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'E-sign request failed');
      }
    };

    createSignatureRequest();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    router.back();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#F5F8FC' 
    }}>
      <Header />
      
      <main style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
      }}>
        {/* Step Header */}
        <div style={{
          width: '100%',
          maxWidth: '36rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0',
          }}>
            <button
              onClick={handleBack}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft style={{ width: '1.25rem', height: '1.25rem', color: '#6B7280' }} />
            </button>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            }}>
              2. E-Sign Redirect
            </span>
          </div>
        </div>

        {/* Loading Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '3rem 2rem',
          textAlign: 'center',
          width: '100%',
          maxWidth: '24rem',
        }}>
          {/* Spinner */}
          <div style={{
            width: '3rem',
            height: '3rem',
            margin: '0 auto 1.5rem',
            border: '3px solid #E5E7EB',
            borderTopColor: '#3B82F6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />

          {/* Text */}
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 500,
            color: '#3B82F6',
            margin: '0 0 0.5rem 0',
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
          }}>
            Redirecting to Secure Signing
          </h2>
          
          <p style={{
            fontSize: '0.875rem',
            color: error ? '#DC2626' : '#6B7280',
            margin: '0 0 1.5rem 0',
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
          }}>
            {error || `Please wait${dots}`}
          </p>

          {/* Secure Connection Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#F3F4F6',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
          }}>
            <Lock style={{ width: '0.875rem', height: '0.875rem', color: '#6B7280' }} />
            <span style={{
              fontSize: '0.75rem',
              color: '#6B7280',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            }}>
              Secure connection
            </span>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* CSS for spinner animation */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
