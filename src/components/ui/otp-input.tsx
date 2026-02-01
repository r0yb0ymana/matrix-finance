/**
 * OTP Input Component
 *
 * 4-digit verification code input with auto-focus and validation
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function OTPInput({
  value,
  onChange,
  onComplete,
  length = 4,
  disabled = false,
  error = false,
  className,
}: OTPInputProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Handle input change
  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newValue = value.split('');
    newValue[index] = digit;
    const newValueString = newValue.join('').slice(0, length);

    onChange(newValueString);

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    // Call onComplete if all digits are entered
    if (newValueString.length === length && onComplete) {
      onComplete(newValueString);
    }
  };

  // Handle key down for backspace and arrow keys
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();

      const newValue = value.split('');

      if (newValue[index]) {
        // Clear current digit
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        // Move to previous and clear
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);

    // Only allow digits
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    onChange(pastedData);

    // Focus the last filled input or first empty one
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    setActiveIndex(nextIndex);

    // Call onComplete if all digits are pasted
    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
  };

  // Handle focus
  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  // Handle click - select all text
  const handleClick = (index: number) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={() => handleFocus(index)}
          onClick={() => handleClick(index)}
          disabled={disabled}
          className={cn(
            "h-14 w-12 text-center text-2xl font-semibold",
            "rounded-lg border-2 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            error
              ? "border-error focus:border-error focus:ring-error"
              : activeIndex === index
              ? "border-primary-900 focus:border-primary-900 focus:ring-primary-900"
              : "border-gray-300 focus:border-primary-900 focus:ring-primary-900",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50",
            "text-primary-900"
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

/**
 * OTP Input with Label and Error Message
 */
interface OTPInputFieldProps extends OTPInputProps {
  label?: string;
  hint?: string;
  errorMessage?: string;
}

export function OTPInputField({
  label,
  hint,
  error,
  errorMessage,
  className,
  ...props
}: OTPInputFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <OTPInput error={error} {...props} />

      {hint && !errorMessage && (
        <p className="text-sm text-gray-500 text-center">{hint}</p>
      )}

      {errorMessage && (
        <p className="text-sm text-error text-center">{errorMessage}</p>
      )}
    </div>
  );
}
