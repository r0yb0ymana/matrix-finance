/**
 * Signature Failed Screen
 * Shown when HelloSign signing fails
 */

"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, ArrowLeft } from "lucide-react";

export default function SignatureFailedPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.push("/application/sign");
  };

  const handleBackToReview = () => {
    router.push("/application/review");
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
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '24rem',
        }}>
          {/* Red Error Banner */}
          <div style={{
            backgroundColor: '#DC2626',
            borderRadius: '0.5rem',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              width: '1.5rem',
              height: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <X style={{ width: '1rem', height: '1rem', color: '#DC2626' }} />
            </div>
            <div>
              <p style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'white',
                margin: 0,
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Signing Could Not Be Completed
              </p>
              <p style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Issue with signing process
              </p>
            </div>
          </div>

          {/* White Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}>
            {/* Error Circle */}
            <div style={{
              width: '3rem',
              height: '3rem',
              margin: '0 auto 1rem',
              backgroundColor: '#FEF2F2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #DC2626',
            }}>
              <AlertCircle style={{ width: '1.5rem', height: '1.5rem', color: '#DC2626' }} />
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 500,
              color: '#111827',
              margin: '0 0 1.25rem 0',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            }}>
              Unable to Complete
            </h2>

            {/* Reasons List */}
            <ul style={{
              textAlign: 'left',
              margin: '0 0 1.25rem 0',
              padding: '0 0 0 1.25rem',
              listStyleType: 'disc',
            }}>
              <li style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: '0.25rem',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Session timeout
              </li>
              <li style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: '0.25rem',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Connection interrupted
              </li>
              <li style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Email not verified
              </li>
            </ul>

            {/* Error Code Box */}
            <div style={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '0.375rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#6B7280',
                margin: '0 0 0.25rem 0',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Error Code
              </p>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#DC2626',
                margin: 0,
                fontFamily: 'monospace',
              }}>
                ESIGN_TIMEOUT_001
              </p>
            </div>

            {/* Retry Button */}
            <Button
              onClick={handleRetry}
              fullWidth
              size="lg"
            >
              Retry Signing
            </Button>

            {/* Back Link */}
            <button
              onClick={handleBackToReview}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                marginTop: '1rem',
                padding: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#3B82F6',
                fontWeight: 500,
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}
            >
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
              Back to Review
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
