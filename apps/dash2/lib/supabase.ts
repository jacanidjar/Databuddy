"use server";

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { ImageSize, IMAGE_SIZES, CropData, ImageEditOptions } from '@/types/image';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Converts a File to a Buffer
 */
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Optimizes an image using Sharp
 */
async function optimizeImage(buffer: Buffer, size: ImageSize = 'medium'): Promise<Buffer> {
  const dimensions = IMAGE_SIZES[size];
  
  let sharpInstance = sharp(buffer).webp({ quality: 80 });
  
  if (dimensions.width && dimensions.height) {
    sharpInstance = sharpInstance.resize({
      width: dimensions.width,
      height: dimensions.height,
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  
  return sharpInstance.toBuffer();
}

/**
 * Applies image edits using Sharp
 */
async function applyImageEdits(buffer: Buffer, edits: ImageEditOptions): Promise<Buffer> {
  let sharpInstance = sharp(buffer);
  
  if (edits.brightness !== undefined) {
    sharpInstance = sharpInstance.modulate({ brightness: 1 + edits.brightness });
  }
  
  if (edits.contrast !== undefined) {
    sharpInstance = sharpInstance.modulate({ 
      brightness: 1 + (edits.contrast * 0.5) 
    });
  }
  
  if (edits.saturation !== undefined) {
    sharpInstance = sharpInstance.modulate({ saturation: 1 + edits.saturation });
  }
  
  if (edits.blur !== undefined) {
    sharpInstance = sharpInstance.blur(edits.blur);
  }
  
  if (edits.grayscale) {
    sharpInstance = sharpInstance.grayscale();
  }
  
  if (edits.sepia) {
    sharpInstance = sharpInstance.tint({ r: 112, g: 66, b: 20 });
  }
  
  if (edits.invert) {
    sharpInstance = sharpInstance.negate();
  }
  
  return sharpInstance.toBuffer();
}

/**
 * Crops an image using Sharp
 */
async function cropImage(buffer: Buffer, cropData: CropData): Promise<Buffer> {
  return sharp(buffer)
    .extract({
      left: Math.round(cropData.x),
      top: Math.round(cropData.y),
      width: Math.round(cropData.width),
      height: Math.round(cropData.height)
    })
    .toBuffer();
}

/**
 * Uploads a file to Supabase Storage
 */
async function uploadToSupabase(
  buffer: Buffer,
  filePath: string,
  bucket: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: 'image/webp',
      cacheControl: '3600'
    });
  
  if (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return publicUrl;
}

/**
 * Uploads an optimized image to Supabase Storage
 */
export async function uploadOptimizedImage(
  file: File, 
  sizes: ImageSize[] = ['medium'], 
  bucket: string = 'profile-images', 
  folder: string = '',
  cropData?: CropData,
  edits?: ImageEditOptions
): Promise<Record<ImageSize, string>> {
  const baseFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  const results: Record<ImageSize, string> = {} as Record<ImageSize, string>;
  
  try {
    // Convert File to Buffer
    let buffer = await fileToBuffer(file);
    
    // Apply edits if provided
    if (edits) {
      buffer = await applyImageEdits(buffer, edits);
    }
    
    // Apply crop if provided
    if (cropData) {
      buffer = await cropImage(buffer, cropData);
    }
    
    // Process each requested size
    for (const size of sizes) {
      try {
        // Optimize the image
        const optimizedBuffer = await optimizeImage(buffer, size);
        
        // Create file path
        const filePath = folder 
          ? `${folder}/${baseFileName}_${size}.webp` 
          : `${baseFileName}_${size}.webp`;
        
        // Upload to Supabase
        results[size] = await uploadToSupabase(optimizedBuffer, filePath, bucket);
      } catch (error) {
        console.error(`Failed to process ${size} image:`, error);
        throw error;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Failed to process image:', error);
    throw error;
  }
}

/**
 * Simple file upload to Supabase Storage
 */
export async function uploadFile(
  file: File, 
  bucket: string = 'profile-images', 
  folder: string = ''
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;
  
  const buffer = await fileToBuffer(file);
  return uploadToSupabase(buffer, filePath, bucket);
} 