/**
 * Business Documents Screen
 * Upload bank statements or retrieve via secure link
 */

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/contexts/ApplicationContext";
import { Upload, Info, Link } from "lucide-react";

export default function BusinessDocumentsPage() {
  const router = useRouter();
  const { updateState, markStepComplete } = useApplication();
  const inputRef = useRef<HTMLInputElement>(null);

  // Document state
  const [bankStatements, setBankStatements] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [linkRequested, setLinkRequested] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setBankStatements(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0] || null;
    setBankStatements(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRetrieveLink = () => {
    // This would open a secure bank statement retrieval flow
    setLinkRequested(true);
    // For now, just mark as complete
  };

  const isFormValid = () => {
    return bankStatements !== null || linkRequested;
  };

  const handleContinue = async () => {
    if (!isFormValid()) {
      setError("Please upload bank statements or use the secure link option");
      return;
    }

    setUploading(true);
    setError("");

    try {
      updateState({
        businessDocuments: {
          bankStatements: bankStatements?.name || null,
          bankStatementLinkUsed: linkRequested,
        },
      });

      markStepComplete(8);
      router.push("/application/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout 
      title="Business Documents" 
      subtitle="Upload your business documents"
      currentStep={8} 
      totalSteps={8}
    >
      <div className="space-y-4">
        {/* Bank Statements Upload Box */}
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            border: bankStatements ? '2px solid #10B981' : '2px dashed #D1D5DB',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: bankStatements ? '#F0FDF4' : 'white',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
          
          <Upload 
            style={{ 
              width: '1.5rem', 
              height: '1.5rem', 
              margin: '0 auto 0.5rem', 
              color: bankStatements ? '#10B981' : '#9CA3AF' 
            }} 
          />
          
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: 500, 
            color: '#374151',
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            marginBottom: '0.25rem',
          }}>
            Bank Statements (PDF preferred)
          </p>
          
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#9CA3AF',
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
          }}>
            {bankStatements ? bankStatements.name : 'Click to upload or drag and drop'}
          </p>
        </div>

        {/* Retrieve Bank Statement Link Button */}
        <button
          onClick={handleRetrieveLink}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1rem',
            backgroundColor: linkRequested ? '#F0FDF4' : 'white',
            border: linkRequested ? '2px solid #10B981' : '2px solid #1a365d',
            borderRadius: '0.5rem',
            color: linkRequested ? '#10B981' : '#1a365d',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Link style={{ width: '1rem', height: '1rem' }} />
          {linkRequested ? 'Bank Statement Link Requested ✓' : 'Retrieve Bank Statement Link'}
        </button>

        {/* Document Requirements Info */}
        <div style={{
          backgroundColor: '#F5F8FC',
          border: '1px solid #E5E7EB',
          borderRadius: '0.5rem',
          padding: '1rem',
          display: 'flex',
          gap: '0.75rem',
        }}>
          <Info style={{ width: '1.25rem', height: '1.25rem', color: '#1a365d', flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <p style={{ 
              fontSize: '0.875rem', 
              fontWeight: 600, 
              color: '#111827',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              marginBottom: '0.5rem',
            }}>
              Document Requirements
            </p>
            <ul style={{ 
              fontSize: '0.8125rem', 
              color: '#6B7280',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              lineHeight: '1.6',
              margin: 0,
              paddingLeft: '0',
              listStyle: 'none',
            }}>
              <li>All documents must be clear and legible</li>
              <li>Accepted formats: JPG, PNG, PDF (max 10mb each)</li>
              <li>Documents must be current and valid</li>
            </ul>
          </div>
        </div>

        {/* Note */}
        <p style={{
          fontSize: '0.8125rem',
          color: '#6B7280',
          fontFamily: 'var(--font-poppins), Poppins, sans-serif',
          lineHeight: '1.5',
        }}>
          You must upload 6 months of bank statements or complete the secure bank statement link to continue.
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '0.5rem',
            color: '#DC2626',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={uploading}
          fullWidth
          size="lg"
        >
          {uploading ? "Processing..." : "Continue"}
        </Button>
      </div>
    </AppLayout>
  );
}
