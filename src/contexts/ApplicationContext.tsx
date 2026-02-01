/**
 * Application Context
 *
 * State management for multi-step application form
 */

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { EntityType } from '@/types/database.types';
import { ABNLookupResult } from '@/lib/abn-lookup';

// =====================================================
// Types
// =====================================================

export interface ApplicationState {
  // Application ID (created when user starts application)
  applicationId?: string;

  // Step 1: Product Selection & Calculator
  financeProduct?: 'chattel_mortgage' | 'rental_lease';
  invoiceAmount?: number;
  termMonths?: number;
  monthlyPayment?: number;
  annualRate?: number;

  // Step 2: Business Lookup (ABN)
  abn?: string;
  abnLookupResult?: ABNLookupResult;

  // Step 3: Business Details
  entityType?: EntityType;
  tradingName?: string;
  businessName?: string;
  acn?: string;
  registeredAddress?: {
    line1: string;
    line2?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  businessAddress?: {
    line1: string;
    line2?: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  sameAsRegistered?: boolean;

  // Step 4: Applicant Details (for Sole Trader)
  applicantEmail?: string;
  applicantPhone?: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  applicantDateOfBirth?: string;
  applicantDriversLicense?: string;

  // Step 5: Financial Position - Assets
  assets?: {
    homeValue?: number;
    investmentProperty?: number;
    cashAtBank?: number;
    vehicles?: number;
    homeContents?: number;
    investmentsShares?: number;
    otherAssets?: number;
  };

  // Step 6: Financial Position - Liabilities
  liabilities?: {
    mortgageHome?: number;
    mortgageInvestment?: number;
    vehicleLoan?: number;
    creditCards?: number;
    otherLiabilities?: number;
  };

  // Step 7: Documents
  documents?: {
    driversLicenseFront?: string;
    driversLicenseBack?: string;
    medicareCard?: string;
  };

  // Step 8: E-Signature
  signatureRequestId?: string;
  signedAt?: string;

  // Progress tracking
  currentStep?: number;
  completedSteps?: number[];
}

interface ApplicationContextValue {
  state: ApplicationState;
  updateState: (updates: Partial<ApplicationState>) => void;
  resetState: () => void;
  markStepComplete: (step: number) => void;
  isStepComplete: (step: number) => boolean;
}

// =====================================================
// Context
// =====================================================

const ApplicationContext = createContext<ApplicationContextValue | undefined>(undefined);

// =====================================================
// Provider
// =====================================================

interface ApplicationProviderProps {
  children: ReactNode;
}

export function ApplicationProvider({ children }: ApplicationProviderProps) {
  const [state, setState] = useState<ApplicationState>({
    currentStep: 1,
    completedSteps: [],
  });

  const updateState = useCallback((updates: Partial<ApplicationState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      currentStep: 1,
      completedSteps: [],
    });
  }, []);

  const markStepComplete = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      completedSteps: Array.from(new Set([...(prev.completedSteps || []), step])),
    }));
  }, []);

  const isStepComplete = useCallback((step: number) => {
    return state.completedSteps?.includes(step) || false;
  }, [state.completedSteps]);

  const value: ApplicationContextValue = {
    state,
    updateState,
    resetState,
    markStepComplete,
    isStepComplete,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

// =====================================================
// Hook
// =====================================================

export function useApplication() {
  const context = useContext(ApplicationContext);

  if (context === undefined) {
    throw new Error('useApplication must be used within ApplicationProvider');
  }

  return context;
}
