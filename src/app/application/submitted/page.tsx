/**
 * Application Submitted Screen
 * Final confirmation after successful submission
 */

"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Plus, LogOut } from "lucide-react";

export default function ApplicationSubmittedPage() {
  const router = useRouter();

  // Generate a reference number (in production would come from backend)
  const referenceNumber = "MEF-2024-78542";

  const handleStartNew = () => {
    router.push("/application/product-selection");
  };

  const handleLogout = () => {
    // In production would clear session and redirect
    router.push("/");
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
          {/* White Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
          }}>
            {/* Success Circle */}
            <div style={{
              width: '4rem',
              height: '4rem',
              margin: '0 auto 1rem',
              backgroundColor: '#F0FDF4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #16A34A',
            }}>
              <Check style={{ width: '2rem', height: '2rem', color: '#16A34A' }} />
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#16A34A',
              margin: '0 0 1.5rem 0',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            }}>
              Application Submitted!
            </h1>

            {/* Reference Number Box */}
            <div style={{
              backgroundColor: '#F5F8FC',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#6B7280',
                margin: '0 0 0.25rem 0',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                Reference Number
              </p>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#1a365d',
                margin: 0,
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                letterSpacing: '0.025em',
              }}>
                {referenceNumber}
              </p>
            </div>

            {/* What Happens Next */}
            <div style={{
              textAlign: 'left',
              marginBottom: '1.5rem',
            }}>
              <h2 style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 0.75rem 0',
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}>
                What Happens Next?
              </h2>
              
              <ol style={{
                margin: 0,
                padding: '0 0 0 1.25rem',
                listStyleType: 'decimal',
              }}>
                <li style={{
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  marginBottom: '0.375rem',
                  fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                }}>
                  Review within 24-48 hours
                </li>
                <li style={{
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  marginBottom: '0.375rem',
                  fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                }}>
                  Email notification with decision
                </li>
                <li style={{
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  marginBottom: '0.375rem',
                  fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                }}>
                  Contract documents if approved
                </li>
                <li style={{
                  fontSize: '0.875rem',
                  color: '#6B7280',
                  fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                }}>
                  Funds disbursed after signing
                </li>
              </ol>
            </div>

            {/* Start New Application Button */}
            <Button
              onClick={handleStartNew}
              fullWidth
              size="lg"
            >
              <Plus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
              Start New Application
            </Button>

            {/* Logout Link */}
            <button
              onClick={handleLogout}
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
                color: '#6B7280',
                fontWeight: 500,
                fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              }}
            >
              <LogOut style={{ width: '1rem', height: '1rem' }} />
              Logout
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
