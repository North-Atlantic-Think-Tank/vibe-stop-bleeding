import fs from 'fs/promises';
import path from 'path';
import { validateArticle } from '../shared/types.js';
import { generateAllCoverVariants } from '../shared/cover-generator.js';
import { publishArticle } from './publish.js';

/**
 * Complete Publishing Workflow
 * 1. Validates article JSON
 * 2. Generates all three cover image styles
 * 3. Updates article JSON with cover image paths
 * 4. Publishes article to markdown
 */
async function completePublish(articleJsonPath) {
  console.log('🚀 Starting Complete Publishing Workflow\n');
  console.log('='.repeat(60));

  // Step 1: Read and validate article JSON
  console.log('\n📄 Step 1: Validating Article JSON...\n');

  let articleData;
  try {
    const rawData = await fs.readFile(articleJsonPath, 'utf-8');
    articleData = JSON.parse(rawData);
    console.log(`✅ Article JSON loaded: "${articleData.title || 'Untitled'}"`);
  } catch (error) {
    console.error(`❌ Failed to read article JSON: ${error.message}`);
    process.exit(1);
  }

  try {
    validateArticle(articleData);
    console.log('✅ Article validation passed');
    console.log(`   - Title: ${articleData.title}`);
    console.log(`   - Category: ${articleData.category}`);
    console.log(`   - Date: ${articleData.date}`);
    console.log(`   - Content length: ${articleData.content?.length || 0} chars`);
  } catch (error) {
    console.error(`❌ Article validation failed: ${error.message}`);
    process.exit(1);
  }

  // Step 2: Generate all cover image styles
  console.log('\n🎨 Step 2: Generating Cover Images (All Styles)...\n');

  let coverResults;
  try {
    coverResults = await generateAllCoverVariants(articleData);
    const successCount = coverResults.filter((r) => !r.error).length;

    if (successCount === 0) {
      console.error('❌ Failed to generate any cover images');
      process.exit(1);
    }

    console.log(`\n✅ Successfully generated ${successCount}/3 cover images`);
  } catch (error) {
    console.error(`❌ Cover generation failed: ${error.message}`);
    process.exit(1);
  }

  // Step 3: Update article JSON with cover image paths
  console.log('\n📝 Step 3: Updating Article JSON with Cover Paths...\n');

  try {
    // Initialize SEO object if it doesn't exist
    if (!articleData.seo) {
      articleData.seo = {};
    }

    // Extract paths from cover results
    const coverPaths = {};
    coverResults.forEach((result) => {
      if (!result.error && result.path) {
        const relativePath = result.path.replace(
          path.join(process.cwd(), 'public'),
          '',
        );
        coverPaths[result.style] = relativePath;
      }
    });

    // Set the default ogImage to moderate style (or first available)
    const defaultCover =
      coverPaths.moderate ||
      coverPaths.aggressive ||
      coverPaths.satirical ||
      '';
    articleData.seo.ogImage = defaultCover;

    // Also store all cover variants in SEO metadata for future use
    articleData.seo.coverImages = coverPaths;

    // Write updated JSON back to file
    await fs.writeFile(
      articleJsonPath,
      JSON.stringify(articleData, null, 2),
      'utf-8',
    );

    console.log('✅ Article JSON updated with cover image paths:');
    console.log(`   - Default (ogImage): ${defaultCover}`);
    Object.entries(coverPaths).forEach(([style, path]) => {
      console.log(`   - ${style}: ${path}`);
    });
  } catch (error) {
    console.error(`❌ Failed to update article JSON: ${error.message}`);
    process.exit(1);
  }

  // Step 4: Publish article to markdown
  console.log('\n📰 Step 4: Publishing Article to Markdown...\n');

  try {
    const markdownPath = await publishArticle(articleJsonPath);
    console.log(`\n✅ Article published successfully!`);
    console.log(`   - JSON: ${articleJsonPath}`);
    console.log(`   - Markdown: ${markdownPath}`);
  } catch (error) {
    console.error(`❌ Publishing failed: ${error.message}`);
    process.exit(1);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Complete Publishing Workflow Finished Successfully!\n');
  console.log('Summary:');
  console.log(`   ✅ Article validated`);
  console.log(
    `   ✅ ${coverResults.filter((r) => !r.error).length}/3 cover images generated`,
  );
  console.log(`   ✅ Article JSON updated with cover paths`);
  console.log(`   ✅ Article published to markdown`);
  console.log('\n' + '='.repeat(60) + '\n');

  return {
    articlePath: articleJsonPath,
    coverImages: coverResults,
    success: true,
  };
}

export { completePublish };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const articlePath = process.argv[2];

  if (!articlePath) {
    console.error(
      '\n❌ Error: Article JSON path is required\n\nUsage: npm run publish -- path/to/article.json\n',
    );
    process.exit(1);
  }

  // Check if file exists
  try {
    await fs.access(articlePath);
  } catch {
    console.error(`\n❌ Error: File not found: ${articlePath}\n`);
    process.exit(1);
  }

  completePublish(articlePath).catch((error) => {
    console.error(`\n❌ Fatal error: ${error.message}\n`);
    process.exit(1);
  });
}
