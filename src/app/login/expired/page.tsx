/**
 * Link Expired Screen
 * Shown when the email link or OTP has expired (48 hours)
 * Matches Figma design
 */

"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Building2 } from "lucide-react";

export default function LinkExpiredPage() {
  // Fonts
  const fontInter = 'var(--font-inter), Inter, sans-serif';
  const fontPoppins = 'var(--font-poppins), Poppins, sans-serif';

  const handleRequestNewInvite = () => {
    // TODO: API call to request new invite
    // For now, redirect to login
    window.location.href = '/login';
  };

  // Styles
  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: '#F5F8FC',
    },
    
    main: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    },
    
    card: {
      width: '100%',
      maxWidth: '24rem',
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
    },
    
    header: {
      backgroundColor: '#1a365d',
      color: 'white',
      padding: '1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    
    headerText: {
      fontSize: '1.125rem',
      fontWeight: 600,
      fontFamily: fontPoppins,
      letterSpacing: '0.05em',
      margin: 0,
    },
    
    content: {
      padding: '2rem 1.5rem',
    },
    
    title: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#111827',
      margin: '0 0 0.75rem 0',
      fontFamily: fontPoppins,
    },
    
    message: {
      fontSize: '0.875rem',
      color: '#6B7280',
      margin: '0 0 1.5rem 0',
      lineHeight: 1.6,
      fontFamily: fontInter,
    },
    
    button: {
      width: '100%',
      height: '2.75rem',
      backgroundColor: '#1a365d',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: fontInter,
      marginBottom: '1.5rem',
    },
    
    helpText: {
      textAlign: 'center' as const,
      fontSize: '0.813rem',
      color: '#6B7280',
      margin: 0,
      fontFamily: fontInter,
    },
  };

  return (
    <div style={styles.page}>
      <Header />
      
      <main style={styles.main}>
        <div style={styles.card}>
          {/* Navy card header */}
          <div style={styles.header}>
            <Building2 size={24} />
            <h1 style={styles.headerText}>MATRIX EF</h1>
          </div>

          {/* Content */}
          <div style={styles.content}>
            <h2 style={styles.title}>This link has expired</h2>
            
            <p style={styles.message}>
              This link has expired. Click &apos;Request new invite&apos; to 
              receive a new link. Your existing information will remain saved.
            </p>

            <button 
              onClick={handleRequestNewInvite}
              style={styles.button}
            >
              Request new invite
            </button>

            <p style={styles.helpText}>
              Call 1300 855 870 if you require assistance
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
