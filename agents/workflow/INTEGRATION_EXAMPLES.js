/**
 * Cover Generator Integration Examples
 *
 * This file demonstrates how to integrate the cover generator
 * into existing workflows. Copy and adapt these examples as needed.
 */

import { generateCoverFromArticle, generateCoverImage } from '../shared/cover-generator.js';
import { publishArticle } from './publish.js';
import fs from 'fs/promises';

// ============================================================================
// EXAMPLE 1: Integration with Editor Write Workflow
// ============================================================================

/**
 * Write article with automatic cover generation
 * This extends the editor:write workflow to generate covers after writing
 */
export async function writeArticleWithCovers(topic, category = 'general') {
  // ... Your existing article writing code here ...
  // const articleData = await writeArticle(topic, category);
  // await fs.writeFile(outputPath, JSON.stringify(articleData, null, 2));

  const outputPath = 'content/articles/article.json'; // Your article path

  // Generate cover images (with error handling)
  let coverResults = null;
  if (process.env.STABILITY_API_KEY) {
    try {
      console.log('\n🎨 Generating cover images...');
      coverResults = await generateCoverFromArticle(outputPath);
      console.log(`✅ Generated ${coverResults.filter(r => !r.error).length}/3 cover variants`);
    } catch (error) {
      console.warn('⚠️  Cover generation failed:', error.message);
      console.warn('    Article will be published without covers');
    }
  } else {
    console.log('⏭️  Skipping cover generation (STABILITY_API_KEY not set)');
  }

  // Continue with publishing
  await publishArticle(outputPath);

  return { outputPath, coverResults };
}

// ============================================================================
// EXAMPLE 2: Integration with Commentary Workflow
// ============================================================================

/**
 * Write editorial commentary with satirical cover
 * Generates only satirical style for opinion pieces
 */
export async function writeCommentaryWithCover(investigationJsonPath) {
  // ... Your existing commentary writing code here ...
  // const commentaryData = await writeCommentary(investigationJsonPath);

  const outputPath = 'content/articles/commentary.json'; // Your commentary path

  // Generate satirical cover (editorial style)
  let coverResult = null;
  if (process.env.STABILITY_API_KEY) {
    try {
      console.log('\n🎨 Generating satirical cover for editorial...');
      coverResult = await generateCoverFromArticle(outputPath, false, 'satirical');
      console.log(`✅ Generated: ${coverResult.path}`);
    } catch (error) {
      console.warn('⚠️  Cover generation failed:', error.message);
    }
  }

  await publishArticle(outputPath);

  return { outputPath, coverResult };
}

// ============================================================================
// EXAMPLE 3: Integration with Research Workflow
// ============================================================================

/**
 * Research workflow with moderate cover style
 * Generates professional moderate style for research articles
 */
export async function researchArticleWithCover(topic) {
  // ... Your existing research workflow code here ...

  const outputPath = 'content/articles/research.json'; // Your article path

  // Generate moderate cover (professional style)
  if (process.env.STABILITY_API_KEY) {
    try {
      console.log('\n🎨 Generating professional cover...');
      const cover = await generateCoverFromArticle(outputPath, false, 'moderate');
      console.log(`✅ Cover: ${cover.path}`);
    } catch (error) {
      console.warn('⚠️  Cover generation skipped');
    }
  }

  return outputPath;
}

// ============================================================================
// EXAMPLE 4: Batch Cover Generation
// ============================================================================

/**
 * Generate covers for multiple existing articles
 * Useful for backfilling covers for old articles
 */
export async function batchGenerateCovers(articlePaths, style = null) {
  console.log(`\n🎨 Batch Cover Generation: ${articlePaths.length} articles\n`);

  const results = [];

  for (const articlePath of articlePaths) {
    console.log(`\n📄 Processing: ${articlePath}`);

    try {
      const coverResults = style
        ? [await generateCoverFromArticle(articlePath, false, style)]
        : await generateCoverFromArticle(articlePath, true, null);

      const successful = coverResults.filter(r => !r.error);
      console.log(`✅ Generated ${successful.length} variant(s)`);

      results.push({ articlePath, success: true, covers: coverResults });
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      results.push({ articlePath, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Batch Generation Summary:');
  console.log(`   Total: ${results.length}`);
  console.log(`   Success: ${results.filter(r => r.success).length}`);
  console.log(`   Failed: ${results.filter(r => !r.success).length}`);

  return results;
}

// ============================================================================
// EXAMPLE 5: Dynamic Style Selection
// ============================================================================

/**
 * Automatically choose style based on article category
 * - politics → satirical (editorial satire)
 * - economy → moderate (professional)
 * - breaking news → aggressive (bold)
 */
export async function generateCoverByCategory(articleJsonPath) {
  // Read article to get category
  const articleData = JSON.parse(await fs.readFile(articleJsonPath, 'utf-8'));
  const category = articleData.category || 'general';

  // Map category to style
  const styleMap = {
    politics: 'satirical',    // Political satire for politics
    economy: 'moderate',      // Professional for economy
    employment: 'moderate',   // Professional for employment
    education: 'moderate',    // Professional for education
    general: 'aggressive',    // Bold for breaking news/general
  };

  const style = styleMap[category] || 'moderate';

  console.log(`\n🎨 Generating ${style} cover for ${category} article...`);

  return await generateCoverFromArticle(articleJsonPath, false, style);
}

// ============================================================================
// EXAMPLE 6: Cover Generation with Fallback
// ============================================================================

/**
 * Try to generate covers, use placeholder if fails
 * Ensures articles always have a cover image
 */
export async function generateCoverWithFallback(articleJsonPath, fallbackImagePath) {
  if (!process.env.STABILITY_API_KEY) {
    console.log('⏭️  Using fallback image (no API key)');
    return { path: fallbackImagePath, generated: false };
  }

  try {
    const result = await generateCoverFromArticle(articleJsonPath, false, 'moderate');
    return { ...result, generated: true };
  } catch (error) {
    console.warn('⚠️  Cover generation failed, using fallback');
    return { path: fallbackImagePath, generated: false, error: error.message };
  }
}

// ============================================================================
// EXAMPLE 7: Cover Generation from Raw Data (No File)
// ============================================================================

/**
 * Generate cover directly from article data without saving to file first
 * Useful when you want covers before finalizing the article
 */
export async function generateCoverFromData(articleData, style = 'moderate') {
  console.log(`\n🎨 Generating ${style} cover from article data...`);

  const result = await generateCoverImage(
    articleData,
    style,
    'public/images/covers',  // Output directory
    `temp-${Date.now()}`     // Temporary filename
  );

  console.log(`✅ Generated: ${result.path}`);
  return result;
}

// ============================================================================
// EXAMPLE 8: CLI Helper for Backfilling Old Articles
// ============================================================================

/**
 * Helper function to backfill covers for all articles in content/articles/
 * Usage: node agents/workflow/INTEGRATION_EXAMPLES.js backfill
 */
export async function backfillAllArticleCovers() {
  const glob = await import('glob');
  const articleFiles = glob.sync('content/articles/*.json');

  console.log(`\n🎨 Backfilling covers for ${articleFiles.length} articles...\n`);

  return await batchGenerateCovers(articleFiles);
}

// ============================================================================
// CLI Execution (for testing examples)
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'backfill':
      backfillAllArticleCovers().catch(console.error);
      break;

    case 'test-category':
      const articlePath = process.argv[3];
      if (!articlePath) {
        console.error('Usage: node INTEGRATION_EXAMPLES.js test-category <article.json>');
        process.exit(1);
      }
      generateCoverByCategory(articlePath).catch(console.error);
      break;

    case 'batch':
      const files = process.argv.slice(3);
      if (files.length === 0) {
        console.error('Usage: node INTEGRATION_EXAMPLES.js batch <file1.json> <file2.json> ...');
        process.exit(1);
      }
      batchGenerateCovers(files).catch(console.error);
      break;

    default:
      console.log('Cover Generator Integration Examples');
      console.log('\nAvailable commands:');
      console.log('  backfill                    - Generate covers for all articles');
      console.log('  test-category <file.json>   - Test category-based style selection');
      console.log('  batch <files...>            - Batch generate covers for multiple files');
      console.log('\nExamples:');
      console.log('  node agents/workflow/INTEGRATION_EXAMPLES.js backfill');
      console.log('  node agents/workflow/INTEGRATION_EXAMPLES.js test-category content/articles/article.json');
      console.log('  node agents/workflow/INTEGRATION_EXAMPLES.js batch article1.json article2.json');
  }
}
