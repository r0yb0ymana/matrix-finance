/**
 * Document Upload API
 *
 * POST /api/documents/upload
 * Upload and store application documents (ID verification)
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { query } from '@/lib/db';

// =====================================================
// Types
// =====================================================

interface UploadResponse {
  success: boolean;
  data?: {
    driversLicenseFront: string;
    driversLicenseBack: string;
    medicareCard: string;
  };
  error?: string;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate unique filename with timestamp
 */
function generateFilename(originalName: string, prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  return `${prefix}_${timestamp}_${random}${ext}`;
}

/**
 * Save file to local storage (for development)
 * In production, this would upload to S3
 */
async function saveFile(file: File, filename: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  // Save file
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  // Return URL path (for serving via Next.js static files in production)
  return `/uploads/documents/${filename}`;
}

/**
 * Mock S3 upload (for development)
 * In production, use AWS SDK to upload to S3
 */
async function uploadToS3Mock(file: File, filename: string): Promise<string> {
  // In production, this would be:
  // const s3 = new S3Client({ region: process.env.AWS_REGION });
  // const command = new PutObjectCommand({
  //   Bucket: process.env.S3_BUCKET,
  //   Key: `documents/${filename}`,
  //   Body: buffer,
  //   ContentType: file.type,
  // });
  // await s3.send(command);
  // return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/documents/${filename}`;

  // For now, save locally
  return saveFile(file, filename);
}

// =====================================================
// API Handler
// =====================================================

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();

    // Get files from form data
    const driversLicenseFrontFile = formData.get('driversLicenseFront') as File;
    const driversLicenseBackFile = formData.get('driversLicenseBack') as File;
    const medicareCardFile = formData.get('medicareCard') as File;
    const applicationId = formData.get('applicationId') as string;

    // Validate files
    if (!driversLicenseFrontFile || !driversLicenseBackFile || !medicareCardFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'All document files are required',
        },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const files = [driversLicenseFrontFile, driversLicenseBackFile, medicareCardFile];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid file type. Only JPG, PNG, and PDF files are allowed.',
          },
          { status: 400 }
        );
      }

      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: 'File size exceeds 10MB limit',
          },
          { status: 400 }
        );
      }
    }

    // Upload files (mock S3 upload for now)
    const [dlFrontUrl, dlBackUrl, medicareUrl] = await Promise.all([
      uploadToS3Mock(
        driversLicenseFrontFile,
        generateFilename(driversLicenseFrontFile.name, 'dl_front')
      ),
      uploadToS3Mock(
        driversLicenseBackFile,
        generateFilename(driversLicenseBackFile.name, 'dl_back')
      ),
      uploadToS3Mock(
        medicareCardFile,
        generateFilename(medicareCardFile.name, 'medicare')
      ),
    ]);

    // TODO: Save document records to database
    // If applicationId is provided, link documents to application
    if (applicationId && applicationId !== 'temp') {
      await query(
        `INSERT INTO documents (
          application_id,
          document_type,
          original_filename,
          s3_url,
          file_size_bytes,
          mime_type
        ) VALUES
          ($1, $2, $3, $4, $5, $6),
          ($1, $7, $8, $9, $10, $11),
          ($1, $12, $13, $14, $15, $16)`,
        [
          applicationId,
          'drivers_license_front',
          driversLicenseFrontFile.name,
          dlFrontUrl,
          driversLicenseFrontFile.size,
          driversLicenseFrontFile.type,
          'drivers_license_back',
          driversLicenseBackFile.name,
          dlBackUrl,
          driversLicenseBackFile.size,
          driversLicenseBackFile.type,
          'medicare_card',
          medicareCardFile.name,
          medicareUrl,
          medicareCardFile.size,
          medicareCardFile.type,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        driversLicenseFront: dlFrontUrl,
        driversLicenseBack: dlBackUrl,
        medicareCard: medicareUrl,
      },
    });

  } catch (error) {
    console.error('Document upload error:', error);

    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to upload documents';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
