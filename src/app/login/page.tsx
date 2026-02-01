/**
 * Login + OTP Screen (Shared Screen 1)
 * Email authentication with OTP verification
 * Matches Figma design with Header & Footer
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);

  // Fonts
  const fontInter = 'var(--font-inter), Inter, sans-serif';
  const fontPoppins = 'var(--font-poppins), Poppins, sans-serif';

  // Countdown timer
  useEffect(() => {
    if (!showOtp || timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setShowOtp(true);
    setTimer(60);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }

      if (newOtp.every((digit) => digit !== "") && index === 3) {
        setTimeout(() => {
          router.push("/application/product-selection");
        }, 500);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResendCode = () => {
    setTimer(60);
    setOtp(["", "", "", ""]);
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
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#111827',
      margin: '0 0 0.25rem 0',
      fontFamily: fontPoppins,
    },
    
    subtitle: {
      fontSize: '0.875rem',
      color: '#6B7280',
      margin: '0 0 1.5rem 0',
      fontFamily: fontInter,
    },
    
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
      marginBottom: '0.5rem',
      fontFamily: fontInter,
    },
    
    input: {
      width: '100%',
      height: '2.75rem',
      padding: '0 1rem',
      fontSize: '1rem',
      color: '#111827',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      outline: 'none',
      backgroundColor: 'white',
      fontFamily: fontInter,
      boxSizing: 'border-box' as const,
    },
    
    recaptcha: {
      marginTop: '1rem',
      padding: '1rem',
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      textAlign: 'center' as const,
      color: '#6B7280',
      fontSize: '0.875rem',
      fontFamily: fontInter,
    },
    
    button: {
      width: '100%',
      height: '2.75rem',
      marginTop: '1.25rem',
      backgroundColor: '#1a365d',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: fontInter,
    },
    
    otpText: {
      textAlign: 'center' as const,
      fontSize: '0.875rem',
      color: '#6B7280',
      marginBottom: '1.5rem',
      lineHeight: 1.6,
      fontFamily: fontInter,
    },
    
    otpContainer: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'center',
      marginBottom: '1rem',
    },
    
    otpInput: {
      width: '3.5rem',
      height: '3.5rem',
      textAlign: 'center' as const,
      fontSize: '1.5rem',
      fontWeight: 600,
      border: '1px solid #E5E7EB',
      borderRadius: '0.5rem',
      outline: 'none',
      fontFamily: fontInter,
    },
    
    timerText: {
      textAlign: 'center' as const,
      fontSize: '0.875rem',
      color: '#6B7280',
      marginBottom: '0.75rem',
      fontFamily: fontInter,
    },
    
    resendLink: {
      display: 'block',
      textAlign: 'center' as const,
      fontSize: '0.875rem',
      color: '#1a365d',
      textDecoration: 'underline',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      marginBottom: '1.5rem',
      fontFamily: fontInter,
      width: '100%',
    },
    
    footerText: {
      textAlign: 'center' as const,
      fontSize: '0.75rem',
      color: '#9CA3AF',
      paddingTop: '1rem',
      borderTop: '1px solid #E5E7EB',
      fontFamily: fontInter,
    },
  };

  return (
    <div style={styles.page}>
      {/* Same Header as other pages */}
      <Header />
      
      {/* Main content area */}
      <main style={styles.main}>
        <div style={styles.card}>
          {/* Navy card header */}
          <div style={styles.header}>
            <Building2 size={24} />
            <h1 style={styles.headerText}>MATRIX EF</h1>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {!showOtp ? (
              <>
                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>Enter email to continue</p>

                <form onSubmit={handleEmailSubmit}>
                  <label style={styles.label}>Email Address*</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    autoFocus
                    style={styles.input}
                  />

                  <div style={styles.recaptcha}>reCAPTCHA</div>

                  <button type="submit" style={styles.button}>
                    Continue
                  </button>
                </form>

                <p style={{ ...styles.otpText, marginTop: '1.5rem', marginBottom: 0 }}>
                  We&apos;ve sent a 4-digit verification code to your email.
                  <br />
                  Enter it below to continue.
                </p>
              </>
            ) : (
              <>
                <p style={styles.otpText}>
                  We&apos;ve sent a 4-digit verification code to your email.
                  <br />
                  Enter it below to continue.
                </p>

                <div style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      autoFocus={index === 0}
                      style={styles.otpInput}
                    />
                  ))}
                </div>

                <p style={styles.timerText}>Code expires in {timer} seconds</p>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={timer > 0}
                  style={{
                    ...styles.resendLink,
                    opacity: timer > 0 ? 0.5 : 1,
                    cursor: timer > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Resend code
                </button>

                <p style={styles.footerText}>
                  You can return to this application using this link for 14 days.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      
      {/* Same Footer as other pages */}
      <Footer />
    </div>
  );
}
