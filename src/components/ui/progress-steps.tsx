"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <li key={step.id} className="relative flex flex-1 flex-col items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    "absolute left-0 right-1/2 top-4 h-0.5 -translate-y-1/2",
                    isCompleted || isCurrent ? "bg-primary-900" : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-1/2 right-0 top-4 h-0.5 -translate-y-1/2",
                    isCompleted ? "bg-primary-900" : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step circle */}
              <div className="relative flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    isCompleted && "bg-primary-900 text-white",
                    isCurrent && "border-2 border-primary-900 bg-white text-primary-900",
                    isUpcoming && "border-2 border-gray-300 bg-white text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isCurrent && "text-primary-900",
                    isCompleted && "text-gray-700",
                    isUpcoming && "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Mobile-friendly stepper (shows X of Y)
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export function StepIndicator({ currentStep, totalSteps, label }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="font-medium text-primary-900">
        Step {currentStep + 1}
      </span>
      <span>of {totalSteps}</span>
      {label && (
        <>
          <span className="text-gray-300">|</span>
          <span>{label}</span>
        </>
      )}
    </div>
  );
}
