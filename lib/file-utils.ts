import { supabase } from './supabase';

// ==================== IMAGE UPLOAD/DELETE ====================

export interface UploadResult {
  success: boolean;
  data?: {
    path: string;
    url: string;
  };
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  bucket: string = 'images',
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      data: {
        path: data.path,
        url: urlData.publicUrl,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Upload multiple images to Supabase Storage
 */
export async function uploadImages(
  files: File[],
  bucket: string = 'images',
  folder: string = 'uploads'
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map((file) => uploadImage(file, bucket, folder))
  );
  return results;
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(
  path: string,
  bucket: string = 'images'
): Promise<DeleteResult> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Download an image from Supabase Storage
 */
export async function downloadImage(
  path: string,
  bucket: string = 'images'
): Promise<{ success: boolean; data?: Blob; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== FILE VALIDATION ====================

export interface FileValidation {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): FileValidation {
  const {
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate Excel file
 */
export function validateExcelFile(file: File): FileValidation {
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
  ];
  
  const allowedExtensions = ['xlsx', 'xls', 'xlsm'];

  if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

// ==================== FILE CONVERSION ====================

/**
 * Convert File to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Convert Base64 string to Blob
 */
export function base64ToBlob(base64: string, type: string): Blob {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
}

/**
 * Convert Blob to File
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}

/**
 * Create downloadable blob from URL
 */
export async function downloadFileFromUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  return response.blob();
}
