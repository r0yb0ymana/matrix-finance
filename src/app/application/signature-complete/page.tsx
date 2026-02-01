/**
 * Signature Complete Screen
 * Shown after user returns from HelloSign
 */

"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useApplication } from "@/contexts/ApplicationContext";

export default function SignatureCompletePage() {
  const router = useRouter();
  const { state } = useApplication();

  // Get signer name from state or use default
  const signerName = state.applicantFirstName && state.applicantLastName
    ? `${state.applicantFirstName} ${state.applicantLastName}`
    : "John Smith";

  const handleContinue = () => {
    router.push("/application/submit");
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
          {/* Green Success Banner */}
          <div style={{
            backgroundColor: '#16A34A',
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
              <Check style={{ width: '1rem', height: '1rem', color: '#16A34A' }} />
            </div>
            <div>
              <p style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'white',
                margin: 0,
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Documents Signed
              </p>
              <p style={{
                fontSize: '0.8125rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Signature recorded
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
            {/* Checkmark Circle */}
            <div style={{
              width: '3rem',
              height: '3rem',
              margin: '0 auto 1rem',
              backgroundColor: '#F0FDF4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #16A34A',
            }}>
              <Check style={{ width: '1.5rem', height: '1.5rem', color: '#16A34A' }} />
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 500,
              color: '#111827',
              margin: '0 0 1.5rem 0',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            }}>
              Signature Complete
            </h2>

            {/* Signature Details */}
            <div style={{
              borderTop: '1px solid #E5E7EB',
              paddingTop: '1rem',
              textAlign: 'left',
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 0.75rem 0',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Signature Details
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                  }}>
                    Signed by:
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#111827',
                    fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                  }}>
                    {signerName}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                  }}>
                    Verified:
                  </span>
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#3B82F6',
                    fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    <Check style={{ width: '0.875rem', height: '0.875rem' }} />
                    Email
                  </span>
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              fullWidth
              size="lg"
              style={{ marginTop: '1.5rem' }}
            >
              Continue to Submit
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
