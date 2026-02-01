/**
 * Main Application Layout
 * Matches Figma design - responsive white card container with progress bar
 */

"use client";

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { ArrowLeft } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  currentStep?: number;
  totalSteps?: number;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function AppLayout({ 
  children, 
  title,
  subtitle,
  currentStep,
  totalSteps = 8,
  showBackButton = false,
  onBack,
}: AppLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
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
        padding: '2rem 1rem',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Responsive centered container */}
        <div style={{ 
          width: '100%',
          maxWidth: '36rem',
          margin: '0 auto',
        }}>
          {/* White card */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
            width: '100%',
            overflow: 'hidden',
          }}>
            {/* Card header with title and step */}
            {(title || showBackButton) && (
              <div style={{ 
                padding: '1.5rem 1.5rem 1rem 1.5rem',
                borderBottom: '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {/* Back button */}
                  {showBackButton && (
                    <button
                      onClick={handleBack}
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        marginLeft: '-0.5rem',
                        marginTop: '-0.25rem',
                      }}
                      aria-label="Go back"
                    >
                      <ArrowLeft style={{ width: '1.25rem', height: '1.25rem', color: '#4B5563' }} />
                    </button>
                  )}
                  
                  {/* Title and subtitle */}
                  <div style={{ flex: 1 }}>
                    {title && (
                      <h1 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: 600, 
                        color: '#111827',
                        margin: 0,
                        fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                      }}>
                        {title}
                      </h1>
                    )}
                    {subtitle && (
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#9CA3AF',
                        marginTop: '0.25rem',
                        marginBottom: 0,
                      }}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Card content */}
            <div style={{ 
              padding: '1.5rem',
            }}>
              {children}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
