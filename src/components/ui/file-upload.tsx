"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, FileText, Check, AlertCircle } from "lucide-react";

interface FileUploadProps {
  label: string;
  required?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect?: (file: File | null) => void;
  hint?: string;
  error?: string;
  className?: string;
}

export function FileUpload({
  label,
  required = false,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 10,
  onFileSelect,
  hint,
  error,
  className,
}: FileUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    // Validate file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(",").map((t) => t.trim());
    const fileExt = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedTypes.some((type) => type === fileExt || type === selectedFile.type)) {
      setUploadError("Invalid file type");
      return;
    }

    setUploadError(null);
    setFile(selectedFile);
    onFileSelect?.(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadError(null);
    onFileSelect?.(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const displayError = error || uploadError;

  return (
    <div className={cn("w-full", className)}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>

      {!file ? (
        <div
          className={cn(
            "relative rounded-card border-2 border-dashed p-6 transition-colors cursor-pointer",
            isDragging
              ? "border-primary-500 bg-primary-50"
              : displayError
              ? "border-error bg-error-light/20"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="sr-only"
          />

          <div className="flex flex-col items-center text-center">
            <Upload
              className={cn(
                "h-8 w-8 mb-3",
                isDragging ? "text-primary-600" : "text-gray-400"
              )}
            />
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {accept.replace(/\./g, "").toUpperCase().split(",").join(", ")} (max {maxSize}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-card border border-gray-200 bg-white p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light">
            <Check className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {displayError && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-error">
          <AlertCircle className="h-4 w-4" />
          {displayError}
        </div>
      )}

      {hint && !displayError && (
        <p className="mt-2 text-sm text-gray-500">{hint}</p>
      )}
    </div>
  );
}
