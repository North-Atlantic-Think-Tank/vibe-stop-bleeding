import {
  generateCoverFromArticle,
  // generateCoverImage,
  // generateAllCoverVariants,
} from '../shared/cover-generator.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Cover Generation Workflow
 * CLI script for generating article cover images using Stability AI
 */

async function runCoverGen() {
  console.log('🎨 Cover Image Generation Workflow\n');
  console.log('='.repeat(60));

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const articlePath = args.find((arg) => !arg.startsWith('--'));
    const styleFlag = args.find((arg) => arg.startsWith('--style='));
    const allStyles = args.includes('--all') || !styleFlag;

    // Validate input
    if (!articlePath) {
      console.error('\n❌ Error: Article JSON path is required\n');
      console.log('Usage:');
      console.log('  npm run workflow:covergen -- <article.json> [options]\n');
      console.log('Options:');
      console.log(
        '  --all                  Generate all three styles (default)',
      );
      console.log('  --style=moderate       Generate only moderate style');
      console.log('  --style=aggressive     Generate only aggressive style');
      console.log('  --style=satirical      Generate only satirical style\n');
      console.log('Examples:');
      console.log(
        '  npm run workflow:covergen -- content/articles/2025-11-26-article.json',
      );
      console.log(
        '  npm run workflow:covergen -- content/articles/2025-11-26-article.json --all',
      );
      console.log(
        '  npm run workflow:covergen -- content/articles/2025-11-26-article.json --style=moderate\n',
      );
      process.exit(1);
    }

    // Check if file exists
    try {
      await fs.access(articlePath);
    } catch (error) {
      console.error(`\n❌ Error: Article file not found: ${articlePath}\n`);
      process.exit(1);
    }

    console.log(`📄 Article: ${path.basename(articlePath)}`);

    // Extract style if specified
    let singleStyle = null;
    if (styleFlag) {
      singleStyle = styleFlag.split('=')[1];
      if (!['moderate', 'aggressive', 'satirical'].includes(singleStyle)) {
        console.error(
          `\n❌ Error: Invalid style "${singleStyle}". Must be: moderate, aggressive, or satirical\n`,
        );
        process.exit(1);
      }
    }

    // Generate cover images
    let results;
    if (allStyles) {
      console.log('🎨 Generating all three style variants...\n');
      results = await generateCoverFromArticle(articlePath, true, null);
    } else {
      console.log(`🎨 Generating ${singleStyle} style variant...\n`);
      results = [
        await generateCoverFromArticle(articlePath, false, singleStyle),
      ];
    }

    // Display results
    console.log('\n📋 Generation Summary');
    console.log('='.repeat(60));

    const successful = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);

    if (successful.length > 0) {
      console.log('\n✅ Successfully generated:');
      successful.forEach((result) => {
        console.log(
          `\n  🎨 ${result.styleConfig?.name || result.style} Style:`,
        );
        console.log(`     📁 ${result.path}`);
        console.log(`     📝 ${result.prompt.substring(0, 80)}...`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed to generate:');
      failed.forEach((result) => {
        console.log(`\n  ⚠️  ${result.style}: ${result.error}`);
      });
    }

    // Update article JSON with satirical cover image path
    const satiricalResult = successful.find((r) => r.style === 'satirical');
    if (satiricalResult) {
      try {
        console.log('\n📝 Updating article JSON with satirical cover image...');

        // Read article JSON
        const articleContent = await fs.readFile(articlePath, 'utf-8');
        const articleData = JSON.parse(articleContent);

        // Ensure seo object exists
        if (!articleData.seo) {
          articleData.seo = {
            metaDescription: '',
            keywords: [],
          };
        }

        // Update ogImage with relative path from public directory
        // Convert absolute path to web-relative path
        const relativePath = satiricalResult.path.replace(/^.*\/public/, '');
        articleData.seo.ogImage = relativePath;

        // Write updated article JSON
        await fs.writeFile(
          articlePath,
          JSON.stringify(articleData, null, 2),
          'utf-8'
        );

        console.log(`     ✅ Updated seo.ogImage: ${relativePath}`);
      } catch (error) {
        console.error(`     ⚠️  Failed to update article JSON: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Cover generation workflow completed!`);
    console.log(
      `📊 Success: ${successful.length}/${results.length} images generated\n`,
    );

    if (failed.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(
      '\n❌ Error during cover generation workflow:',
      error.message,
    );
    console.error(error.stack);
    process.exit(1);
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  runCoverGen().catch(console.error);
}

export { runCoverGen };
