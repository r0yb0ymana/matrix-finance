/**
 * Supporting Documents Screen
 * Step 7 - Upload identity documents
 */

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/contexts/ApplicationContext";
import { Upload, Info } from "lucide-react";

// Label style matching other pages
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '0.25rem',
  fontFamily: 'var(--font-poppins), Poppins, sans-serif',
};

interface UploadBoxProps {
  label: string;
  required?: boolean;
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

function UploadBox({ label, required, file, onFileSelect }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0] || null;
    onFileSelect(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        border: file ? '2px solid #10B981' : '2px dashed #D1D5DB',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: file ? '#F0FDF4' : 'white',
        transition: 'border-color 0.2s, background-color 0.2s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      
      <Upload 
        style={{ 
          width: '1.5rem', 
          height: '1.5rem', 
          margin: '0 auto 0.5rem', 
          color: file ? '#10B981' : '#9CA3AF' 
        }} 
      />
      
      <p style={{ 
        fontSize: '0.875rem', 
        fontWeight: 500, 
        color: '#374151',
        fontFamily: 'var(--font-poppins), Poppins, sans-serif',
        marginBottom: '0.25rem',
      }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </p>
      
      <p style={{ 
        fontSize: '0.75rem', 
        color: '#9CA3AF',
        fontFamily: 'var(--font-poppins), Poppins, sans-serif',
      }}>
        {file ? file.name : 'Click to upload or drag and drop'}
      </p>
    </div>
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const { updateState, markStepComplete } = useApplication();

  // Document state
  const [driversLicenseFront, setDriversLicenseFront] = useState<File | null>(null);
  const [driversLicenseBack, setDriversLicenseBack] = useState<File | null>(null);
  const [medicareCard, setMedicareCard] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = () => {
    return driversLicenseFront && driversLicenseBack && medicareCard;
  };

  const handleContinue = async () => {
    if (!isFormValid()) {
      setError("Please upload all required documents");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // For now, just mark as complete and continue
      // Real upload logic would go here
      updateState({
        documents: {
          driversLicenseFront: driversLicenseFront?.name,
          driversLicenseBack: driversLicenseBack?.name,
          medicareCard: medicareCard?.name,
        },
      });

      markStepComplete(7);
      router.push("/application/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout 
      title="Supporting Documents" 
      subtitle="Upload your documents"
      currentStep={7} 
      totalSteps={8}
    >
      <div className="space-y-4">
        {/* Upload Boxes */}
        <UploadBox
          label="Driver's Licence (Front)"
          required
          file={driversLicenseFront}
          onFileSelect={setDriversLicenseFront}
        />

        <UploadBox
          label="Driver's Licence (Back)"
          required
          file={driversLicenseBack}
          onFileSelect={setDriversLicenseBack}
        />

        <UploadBox
          label="Medicare Card"
          required
          file={medicareCard}
          onFileSelect={setMedicareCard}
        />

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
          {uploading ? "Uploading..." : "Continue"}
        </Button>
      </div>
    </AppLayout>
  );
}
