/**
 * Branded Header Component
 * Matrix Equipment Finance - Responsive design
 */

import Image from 'next/image';
import Link from 'next/link';

export function Header() {
  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #E5E7EB',
    }}>
      <div style={{
        maxWidth: '36rem', // Match form card width
        margin: '0 auto',
        padding: '1rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/images/logo.png"
            alt="Matrix Equipment Finance"
            width={160}
            height={36}
            priority
            style={{ height: '2rem', width: 'auto' }}
          />
        </Link>

        {/* Application context text */}
        <div style={{
          fontSize: '0.875rem',
          color: '#6B7280',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        }}>
          Equipment Finance Application
        </div>
      </div>
    </header>
  );
}
