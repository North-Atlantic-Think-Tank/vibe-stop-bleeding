import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { publishArticle } from './publish.js';

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

      console.log('📰 Select an investigation article for commentary:\n');
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
        `\n   Total: ${files.length} files | Selected: ${selectedIndex + 1}/${files.length}`,
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
 * Commentary Workflow
 * Writes an Editorial Commentary article based on journalist investigation results
 */
async function writeCommentary(investigationJsonPath) {
  console.log('📝 Editorial Commentary Workflow\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Read investigation JSON
    console.log('\n📋 STEP 1: Loading Investigation Data');
    console.log('-'.repeat(60));

    const investigationData = JSON.parse(
      await fs.readFile(investigationJsonPath, 'utf-8')
    );

    console.log(`✅ Loaded investigation: "${investigationData.title || 'Untitled'}"`);

    // Step 2: Load editor prompt for commentary writing
    console.log('\n📋 STEP 2: Preparing Commentary');
    console.log('-'.repeat(60));

    const editorPrompt = await fs.readFile(
      path.join(process.cwd(), 'agents/editor/prompt.md'),
      'utf-8'
    );

    // Build context from investigation
    const investigationContext = `
INVESTIGATION TITLE: ${investigationData.title || 'N/A'}
CATEGORY: ${investigationData.category || 'general'}
SUMMARY: ${investigationData.summary || 'N/A'}

KEY FINDINGS:
${investigationData.key_findings ? investigationData.key_findings.map((f, i) => `${i + 1}. ${f}`).join('\n') : 'N/A'}

INVESTIGATION CONTENT:
${investigationData.content || investigationData.article || 'No content available'}

SOURCES:
${investigationData.sources ? investigationData.sources.map((s, i) => `${i + 1}. ${s.title} - ${s.url}`).join('\n') : 'No sources'}
`;

    const commentaryRequest = `Write an Editorial Commentary article based on the following investigative journalism report.

${investigationContext}

Your task as Editor-in-Chief is to write a commentary (800-1500 words) that:

1. **Provides editorial perspective** on the investigation findings
2. **Analyzes the implications** for Canadians and Canadian policy
3. **Offers informed opinion** on what should happen next
4. **Maintains journalistic standards** - balanced, fact-based, but with clear editorial voice
5. **Engages readers** with compelling arguments and forward-looking analysis

The commentary should be distinct from the investigation - it's your editorial voice responding to the facts uncovered, not repeating them.

Output the commentary in JSON format matching the article schema:
{
  "title": "Editorial: [Your Commentary Title]",
  "category": "${investigationData.category || 'general'}",
  "date": "${new Date().toISOString().split('T')[0]}",
  "author": "stopbleeding.ca Editorial Team",
  "summary": "...",
  "content": "... (markdown) ...",
  "charts": [...] (reuse relevant charts from investigation if applicable),
  "sources": [...] (include investigation sources plus any new references),
  "tags": [...] (include "editorial", "commentary" plus topic tags),
  "seo": {...}
}`;

    console.log('✍️  Generating editorial commentary...\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: editorPrompt,
      messages: [
        {
          role: 'user',
          content: commentaryRequest,
        },
      ],
    });

    const response = message.content[0].text;

    // Step 3: Extract and save commentary JSON
    console.log('\n📋 STEP 3: Saving Commentary');
    console.log('-'.repeat(60));

    let commentaryData;
    try {
      const jsonMatch =
        response.match(/```json\n([\s\S]*?)\n```/) ||
        response.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        commentaryData = JSON.parse(jsonMatch[1]);
      } else {
        commentaryData = JSON.parse(response);
      }
    } catch (e) {
      console.error('⚠️  Could not parse JSON response. Saving raw output.');
      commentaryData = { raw: response };
    }

    // Ensure date is today
    const today = new Date().toISOString().split('T')[0];
    commentaryData.date = today;

    // Add editorial metadata
    if (!commentaryData.tags) {
      commentaryData.tags = [];
    }
    if (!commentaryData.tags.includes('editorial')) {
      commentaryData.tags.unshift('editorial');
    }
    if (!commentaryData.tags.includes('commentary')) {
      commentaryData.tags.push('commentary');
    }

    // Generate filename
    const slug = (commentaryData.title || 'commentary')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50);

    const outputPath = path.join(
      process.cwd(),
      'content/articles',
      `${today}-editorial-${slug}.json`
    );

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(commentaryData, null, 2));

    console.log('✅ Commentary saved!');
    console.log(`📄 JSON: ${outputPath}`);

    // Step 4: Publish to markdown
    console.log('\n📋 STEP 4: Publishing');
    console.log('-'.repeat(60));

    const mdFilePath = await publishArticle(outputPath);

    console.log('✅ Commentary published!');
    console.log(`📄 Markdown: ${mdFilePath}`);

    // Step 5: Summary
    console.log('\n📋 STEP 5: Completion Summary');
    console.log('-'.repeat(60));
    console.log(`\n📌 Title: ${commentaryData.title}`);
    console.log(`📂 Category: ${commentaryData.category}`);
    console.log(`🏷️  Tags: ${commentaryData.tags.join(', ')}`);
    console.log('\n' + '='.repeat(60));
    console.log('✅ Editorial Commentary workflow completed successfully!\n');

    return commentaryData;

  } catch (error) {
    console.error('\n❌ Error during commentary workflow:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

export { writeCommentary, selectArticleFile };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  let investigationPath = process.argv[2];

  // If no path provided, show interactive selector
  if (!investigationPath) {
    investigationPath = await selectArticleFile();
  } else {
    // Check if provided file exists
    try {
      await fs.access(investigationPath);
    } catch {
      console.error(`\n❌ Error: File not found: ${investigationPath}\n`);
      process.exit(1);
    }
  }

  writeCommentary(investigationPath).catch((error) => {
    console.error(`\n❌ Fatal error: ${error.message}\n`);
    process.exit(1);
  });
}
