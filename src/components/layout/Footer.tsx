/**
 * Simple Footer for Application Form - Responsive
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#F9FAFB',
      borderTop: '1px solid #E5E7EB',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '36rem',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: '#6B7280',
          margin: '0 0 0.5rem 0',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        }}>
          © {currentYear} Matrix Equipment Finance. All rights reserved.
        </p>
        <p style={{
          fontSize: '0.75rem',
          color: '#9CA3AF',
          margin: 0,
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        }}>
          ABN: XX XXX XXX XXX | Australian Credit Licence: XXXXXX
        </p>
      </div>
    </footer>
  );
}
