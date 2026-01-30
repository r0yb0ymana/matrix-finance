import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary - Navy filled
        primary:
          "bg-primary-900 text-white hover:bg-primary-800 active:bg-primary-950 shadow-button",
        // Secondary - Outlined
        secondary:
          "border-2 border-primary-900 text-primary-900 bg-transparent hover:bg-primary-50 active:bg-primary-100",
        // Ghost - Minimal
        ghost:
          "text-primary-900 hover:bg-primary-50 active:bg-primary-100",
        // Danger
        danger:
          "bg-error text-white hover:bg-error-dark active:bg-red-700",
        // Success
        success:
          "bg-success text-white hover:bg-success-dark active:bg-green-700",
        // Link style
        link:
          "text-primary-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm rounded-button",
        md: "h-11 px-5 text-base rounded-button",
        lg: "h-13 px-7 text-lg rounded-button",
        icon: "h-10 w-10 rounded-button",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
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

export { Button, buttonVariants };
