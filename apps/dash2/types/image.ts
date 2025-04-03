// Image size presets for optimization
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  original: { width: null, height: null }
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

// Image crop data
export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  unit: 'px' | '%';
}

// Image edit options
export interface ImageEditOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
} 