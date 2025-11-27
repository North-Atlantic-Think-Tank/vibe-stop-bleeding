import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

/**
 * Thumbnail Generator
 * Generates low-resolution placeholder thumbnails from cover images
 * for optimized lazy loading experience
 */

const THUMBNAIL_WIDTH = 40; // Very small width for blur placeholder
const THUMBNAIL_QUALITY = 60; // Lower quality for smaller file size

/**
 * Generate a thumbnail from an image buffer
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {string} outputPath - Path to save the thumbnail
 * @returns {Promise<Object>} Object with path, dimensions, and base64 data
 */
export async function generateThumbnailFromBuffer(imageBuffer, outputPath) {
  try {
    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Generate thumbnail with Sharp
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(THUMBNAIL_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: THUMBNAIL_QUALITY,
        progressive: true,
      })
      .toBuffer();

    // Save thumbnail file
    await fs.writeFile(outputPath, thumbnailBuffer);

    // Get metadata
    const metadata = await sharp(thumbnailBuffer).metadata();

    // Generate base64 data URL for inline usage
    const base64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;

    console.log(`📦 Generated thumbnail: ${outputPath} (${thumbnailBuffer.length} bytes)`);

    return {
      path: outputPath,
      width: metadata.width,
      height: metadata.height,
      size: thumbnailBuffer.length,
      base64,
    };
  } catch (error) {
    console.error(`Error generating thumbnail: ${error.message}`);
    throw error;
  }
}

/**
 * Generate thumbnail from existing image file
 * @param {string} imagePath - Path to original image
 * @param {string} outputPath - Path to save thumbnail (optional, auto-generated from imagePath)
 * @returns {Promise<Object>} Object with path, dimensions, and base64 data
 */
export async function generateThumbnailFromFile(imagePath, outputPath = null) {
  try {
    // Read original image
    const imageBuffer = await fs.readFile(imagePath);

    // Auto-generate output path if not provided
    if (!outputPath) {
      const parsedPath = path.parse(imagePath);
      const thumbnailDir = path.join(
        process.cwd(),
        'public/images/thumbnails',
      );
      outputPath = path.join(
        thumbnailDir,
        `${parsedPath.name}.jpg`, // Always use .jpg for thumbnails
      );
    }

    return await generateThumbnailFromBuffer(imageBuffer, outputPath);
  } catch (error) {
    console.error(`Error generating thumbnail from file: ${error.message}`);
    throw error;
  }
}

/**
 * Generate thumbnails for all three style variants of a cover image
 * @param {string} fileName - Base filename (e.g., "2025-11-26-article-title")
 * @param {string} coverDir - Directory containing cover images
 * @param {string} thumbnailDir - Directory to save thumbnails
 * @returns {Promise<Object>} Object with thumbnails for each style
 */
export async function generateAllThumbnails(
  fileName,
  coverDir = null,
  thumbnailDir = null,
) {
  if (!coverDir) {
    coverDir = path.join(process.cwd(), 'public/images/covers');
  }
  if (!thumbnailDir) {
    thumbnailDir = path.join(process.cwd(), 'public/images/thumbnails');
  }

  const styles = ['moderate', 'aggressive', 'satirical'];
  const results = {};

  console.log(`\n📦 Generating thumbnails for: ${fileName}`);

  for (const style of styles) {
    try {
      const coverPath = path.join(coverDir, `${fileName}-${style}.jpeg`);
      const thumbnailPath = path.join(
        thumbnailDir,
        `${fileName}-${style}.jpg`,
      );

      // Check if cover image exists
      try {
        await fs.access(coverPath);
      } catch {
        console.log(`⚠️  Cover image not found: ${coverPath}`);
        continue;
      }

      const result = await generateThumbnailFromFile(coverPath, thumbnailPath);
      results[style] = result;

      console.log(`✅ ${style}: ${result.size} bytes`);
    } catch (error) {
      console.error(`❌ Failed to generate ${style} thumbnail: ${error.message}`);
      results[style] = { error: error.message };
    }
  }

  return results;
}

/**
 * Generate thumbnail immediately from Stability AI response buffer
 * This can be called during cover image generation to create thumbnail
 * at the same time without re-reading the file
 * @param {Buffer} imageBuffer - Image buffer from Stability AI API
 * @param {string} fileName - Base filename without extension
 * @param {string} style - Style variant (moderate, aggressive, satirical)
 * @returns {Promise<Object>} Thumbnail metadata
 */
export async function generateThumbnailFromAPIResponse(
  imageBuffer,
  fileName,
  style,
) {
  const thumbnailDir = path.join(process.cwd(), 'public/images/thumbnails');
  const thumbnailPath = path.join(thumbnailDir, `${fileName}-${style}.jpg`);

  return await generateThumbnailFromBuffer(imageBuffer, thumbnailPath);
}

export default {
  generateThumbnailFromBuffer,
  generateThumbnailFromFile,
  generateAllThumbnails,
  generateThumbnailFromAPIResponse,
};
