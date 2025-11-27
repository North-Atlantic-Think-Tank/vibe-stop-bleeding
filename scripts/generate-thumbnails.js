#!/usr/bin/env node

/**
 * Generate Thumbnails Script
 * Creates thumbnail placeholders for all existing cover images
 * Usage: node scripts/generate-thumbnails.js
 */

import { readdir } from 'fs/promises';
import { join, parse } from 'path';
import { generateThumbnailFromFile } from '../agents/shared/thumbnail-generator.js';

async function generateAllThumbnails() {
  console.log('\n📦 Generating Thumbnails for All Cover Images');
  console.log('='.repeat(60));

  const coversDir = join(process.cwd(), 'public/images/covers');
  const thumbnailsDir = join(process.cwd(), 'public/images/thumbnails');

  try {
    // Read all files in covers directory
    const files = await readdir(coversDir);
    const imageFiles = files.filter(
      (f) => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'),
    );

    console.log(`\nFound ${imageFiles.length} cover images\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of imageFiles) {
      try {
        const coverPath = join(coversDir, file);
        const parsedPath = parse(file);
        const thumbnailPath = join(thumbnailsDir, `${parsedPath.name}.jpg`);

        const result = await generateThumbnailFromFile(coverPath, thumbnailPath);

        console.log(
          `✅ ${file} → ${result.size} bytes (${result.width}x${result.height})`,
        );
        successCount++;
      } catch (error) {
        console.error(`❌ ${file}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(
      `✅ Generated ${successCount} thumbnails (${errorCount} errors)\n`,
    );
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the script
generateAllThumbnails();
