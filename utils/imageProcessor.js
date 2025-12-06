// utils/imageProcessor.js
const sharp = require('sharp');

/**
 * Security validation for image uploads
 * Prevents image-based attacks and malicious files
 */
const validateImage = (base64Image) => {
  try {
    // Check if it's a valid base64 string
    if (!base64Image || typeof base64Image !== 'string') {
      return { valid: false, error: 'Invalid image data' };
    }

    // Extract MIME type from base64
    const mimeMatch = base64Image.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/);
    if (!mimeMatch) {
      return { 
        valid: false, 
        error: 'Invalid image format. Only JPEG, PNG, GIF, and WEBP are allowed' 
      };
    }

    const mimeType = mimeMatch[1];
    
    // Remove data URI prefix
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    
    // Validate base64 format
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
      return { valid: false, error: 'Corrupted image data' };
    }

    // Calculate size
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    // Size limit: 5MB
    if (sizeInMB > 5) {
      return { 
        valid: false, 
        error: `Image too large (${sizeInMB.toFixed(2)}MB). Maximum: 5MB` 
      };
    }

    return { 
      valid: true, 
      mimeType,
      size: sizeInMB,
      base64Data 
    };

  } catch (error) {
    console.error('Image validation error:', error);
    return { valid: false, error: 'Failed to validate image' };
  }
};

/**
 * Compress profile image with security checks
 * Uses Sharp library for high-quality compression
 */
const compressProfileImage = async (base64Image, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 85,
    format = 'jpeg'
  } = options;

  try {
    // Security validation first
    const validation = validateImage(base64Image);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(validation.base64Data, 'base64');

    // Security: Load image and verify it's actually an image
    let image = sharp(imageBuffer);
    const metadata = await image.metadata();

    // Security checks on dimensions
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: no dimensions found');
    }

    if (metadata.width > 10000 || metadata.height > 10000) {
      throw new Error('Image dimensions too large (max 10000x10000px)');
    }

    if (metadata.width < 50 || metadata.height < 50) {
      throw new Error('Image too small (min 50x50px)');
    }

    // Security: Strip all metadata (EXIF, GPS, etc.) to prevent data leaks
    image = sharp(imageBuffer).rotate(); // Auto-rotate based on EXIF

    // Resize if needed while maintaining aspect ratio
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image = image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3 // High-quality resampling
      });
    }

    // Convert to desired format with compression
    let compressed;
    if (format === 'jpeg' || format === 'jpg') {
      compressed = await image
        .jpeg({
          quality,
          progressive: true,
          mozjpeg: true // Use MozJPEG for better compression
        })
        .toBuffer();
    } else if (format === 'png') {
      compressed = await image
        .png({
          quality,
          compressionLevel: 9,
          palette: true
        })
        .toBuffer();
    } else if (format === 'webp') {
      compressed = await image
        .webp({
          quality,
          effort: 6
        })
        .toBuffer();
    } else {
      // Default to JPEG
      compressed = await image
        .jpeg({ quality, progressive: true, mozjpeg: true })
        .toBuffer();
    }

    // Convert back to base64
    const compressedBase64 = `data:image/${format === 'jpg' ? 'jpeg' : format};base64,${compressed.toString('base64')}`;

    // Final size check
    const finalSize = (compressedBase64.length * 3) / 4 / (1024 * 1024);
    if (finalSize > 0.5) { // 512KB limit after compression
      throw new Error('Image still too large after compression. Please use a smaller image.');
    }

    return compressedBase64;

  } catch (error) {
    console.error('Image compression error:', error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Alternative: Client-side compression fallback
 * For when Sharp isn't available (serverless environments)
 */
const compressProfileImageFallback = async (base64Image, options = {}) => {
  const { maxWidth = 800, maxHeight = 800 } = options;

  try {
    const validation = validateImage(base64Image);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Return as-is if already small enough
    const currentSize = (base64Image.length * 3) / 4 / (1024 * 1024);
    if (currentSize <= 0.2) {
      return base64Image;
    }

    // Simple validation - just check format and size
    // Actual compression should happen client-side
    return base64Image;

  } catch (error) {
    throw new Error(`Image validation failed: ${error.message}`);
  }
};

/**
 * Sanitize filename to prevent directory traversal attacks
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9_\-\.]/gi, '_') // Only allow safe characters
    .substring(0, 100); // Limit length
};

/**
 * Generate secure random filename
 */
const generateSecureFilename = (userId, extension = 'jpg') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `profile_${userId}_${timestamp}_${random}.${extension}`;
};

module.exports = {
  validateImage,
  compressProfileImage,
  compressProfileImageFallback,
  sanitizeFilename,
  generateSecureFilename
};