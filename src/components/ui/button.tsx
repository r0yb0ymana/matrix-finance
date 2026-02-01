import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    fullWidth, 
    asChild = false, 
    loading, 
    children, 
    disabled, 
    style,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Base styles
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      whiteSpace: 'nowrap',
      fontWeight: 600,
      borderRadius: '0.5rem',
      border: 'none',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s',
      opacity: 1, // Keep full opacity per Figma design
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-inter), Inter, sans-serif',
    };

    // Size styles
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { height: '2.25rem', padding: '0 0.75rem', fontSize: '0.875rem' },
      md: { height: '2.5rem', padding: '0 1rem', fontSize: '0.875rem' },
      lg: { height: '3rem', padding: '0 1.5rem', fontSize: '1rem' },
      icon: { height: '2.5rem', width: '2.5rem', padding: 0 },
    };

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: { 
        backgroundColor: '#1a365d', 
        color: 'white',
      },
      secondary: { 
        backgroundColor: 'transparent', 
        color: '#1E2C5E',
        border: '2px solid #1E2C5E',
      },
      ghost: { 
        backgroundColor: 'transparent', 
        color: '#1E2C5E',
      },
      danger: { 
        backgroundColor: '#EF4444', 
        color: 'white',
      },
      success: { 
        backgroundColor: '#10B981', 
        color: 'white',
      },
      link: { 
        backgroundColor: 'transparent', 
        color: '#1E2C5E',
        textDecoration: 'underline',
      },
    };

    const combinedStyle: React.CSSProperties = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    return (
      <Comp
        className={cn(className)}
        ref={ref}
        disabled={disabled || loading}
        style={combinedStyle}
        {...props}
      >
        {loading ? (
          <>
            <svg
              style={{ height: '1rem', width: '1rem', animation: 'spin 1s linear infinite' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
