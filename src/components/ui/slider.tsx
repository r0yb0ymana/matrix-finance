/**
 * Slider Component
 *
 * Range slider for numeric input (equipment cost, loan term)
 */

"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
  showValue?: boolean;
  hint?: string;
}

export function Slider({
  label,
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
  showValue = true,
  hint,
  className,
  ...props
}: SliderProps) {
  const displayValue = formatValue ? formatValue(value[0]) : value[0].toString();

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {showValue && (
            <span className="text-sm font-semibold text-primary-900">
              {displayValue}
            </span>
          )}
        </div>
      )}

      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
          <SliderPrimitive.Range className="absolute h-full bg-primary-900" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary-900 bg-white",
            "ring-offset-white transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "hover:shadow-md cursor-pointer"
          )}
        />
      </SliderPrimitive.Root>

      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatValue ? formatValue(min) : min.toLocaleString()}</span>
        <span>{formatValue ? formatValue(max) : max.toLocaleString()}</span>
      </div>
    </div>
  );
}
