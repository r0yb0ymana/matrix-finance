import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, style, ...props }, ref) => {
    const inputId = id || React.useId();
    
    const labelStyle: React.CSSProperties = {
      marginBottom: '0.375rem',
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#374151',
    };

    const inputStyle: React.CSSProperties = {
      display: 'flex',
      height: '2.75rem',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      borderRadius: '0.375rem',
      border: error ? '1px solid #EF4444' : '1px solid #D1D5DB',
      backgroundColor: 'white',
      padding: '0.5rem 1rem',
      fontSize: '1rem',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      outline: 'none',
      ...style,
    };

    const errorStyle: React.CSSProperties = {
      marginTop: '0.375rem',
      fontSize: '0.875rem',
      color: '#EF4444',
    };

    const hintStyle: React.CSSProperties = {
      marginTop: '0.375rem',
      fontSize: '0.875rem',
      color: '#6B7280',
    };
    
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(className)}
          ref={ref}
          style={inputStyle}
          {...props}
        />
        {error && (
          <p style={errorStyle}>{error}</p>
        )}
        {hint && !error && (
          <p style={hintStyle}>{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
