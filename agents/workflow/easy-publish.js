import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { validateArticle } from '../shared/types.js';
import { generateAllCoverVariants } from '../shared/cover-generator.js';
import { publishArticle } from './publish.js';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

/**
 * Get all JSON files from content/articles sorted by creation time (newest first)
 */
async function getArticleJsonFiles() {
  const files = await fs.readdir(ARTICLES_DIR);
  const jsonFiles = files.filter((f) => f.endsWith('.json'));

  // Get file stats and sort by birthtime (creation time) descending
  const filesWithStats = await Promise.all(
    jsonFiles.map(async (filename) => {
      const filepath = path.join(ARTICLES_DIR, filename);
      const stats = await fs.stat(filepath);
      return {
        filename,
        filepath,
        birthtime: stats.birthtime,
      };
    }),
  );

  return filesWithStats.sort((a, b) => b.birthtime - a.birthtime);
}

/**
 * Interactive file selector with arrow key navigation
 */
async function selectArticleFile() {
  const files = await getArticleJsonFiles();

  if (files.length === 0) {
    console.error('\n❌ No JSON files found in content/articles/\n');
    process.exit(1);
  }

  return new Promise((resolve) => {
    let selectedIndex = 0;
    // 5 rows at most in one page
    const maxVisible = Math.min(5, files.length);

    const renderList = () => {
      // Clear previous render
      process.stdout.write('\x1B[2J\x1B[0f');

      console.log('📰 Select an article to publish:\n');
      console.log(
        '   Use ↑/↓ arrow keys to navigate, Enter to confirm, q to quit\n',
      );
      console.log('-'.repeat(70));

      // Calculate visible window
      let startIndex = 0;
      if (selectedIndex >= maxVisible) {
        startIndex = selectedIndex - maxVisible + 1;
      }
      const endIndex = Math.min(startIndex + maxVisible, files.length);

      // Show scroll indicator if needed
      if (startIndex > 0) {
        console.log('   ↑ more files above...');
      }

      for (let i = startIndex; i < endIndex; i++) {
        const file = files[i];
        const isSelected = i === selectedIndex;
        const prefix = isSelected ? ' ▶ ' : '   ';
        const date = file.birthtime.toLocaleDateString('en-CA');
        const time = file.birthtime.toLocaleTimeString('en-CA', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const line = `${prefix}${file.filename}`;
        const meta = `[${date} ${time}]`;

        if (isSelected) {
          // Highlight selected item
          console.log(`\x1B[36m${line}\x1B[0m`);
          console.log(`\x1B[90m      ${meta}\x1B[0m`);
        } else {
          console.log(line);
          console.log(`\x1B[90m      ${meta}\x1B[0m`);
        }
      }

      // Show scroll indicator if needed
      if (endIndex < files.length) {
        console.log('   ↓ more files below...');
      }

      console.log('-'.repeat(70));
      console.log(
        `\n   Total: ${files.length} files | Selected: ${selectedIndex + 1}/${
          files.length
        }`,
      );
    };

    // Initial render
    renderList();

    // Set up raw mode for key input
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    const handleKeypress = (str, key) => {
      if (key.name === 'up') {
        selectedIndex = Math.max(0, selectedIndex - 1);
        renderList();
      } else if (key.name === 'down') {
        selectedIndex = Math.min(files.length - 1, selectedIndex + 1);
        renderList();
      } else if (key.name === 'return') {
        cleanup();
        console.log(`\n✅ Selected: ${files[selectedIndex].filename}\n`);
        resolve(files[selectedIndex].filepath);
      } else if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        cleanup();
        console.log('\n❌ Selection cancelled\n');
        process.exit(0);
      }
    };

    const cleanup = () => {
      process.stdin.removeListener('keypress', handleKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    };

    process.stdin.on('keypress', handleKeypress);
    process.stdin.resume();
  });
}

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
    console.log(
      `   - Content length: ${articleData.content?.length || 0} chars`,
    );
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
    `   ✅ ${
      coverResults.filter((r) => !r.error).length
    }/3 cover images generated`,
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

export { completePublish, selectArticleFile };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  let articlePath = process.argv[2];

  // If no path provided, show interactive selector
  if (!articlePath) {
    articlePath = await selectArticleFile();
  } else {
    // Check if provided file exists
    try {
      await fs.access(articlePath);
    } catch {
      console.error(`\n❌ Error: File not found: ${articlePath}\n`);
      process.exit(1);
    }
  }

  completePublish(articlePath).catch((error) => {
    console.error(`\n❌ Fatal error: ${error.message}\n`);
    process.exit(1);
  });
}
