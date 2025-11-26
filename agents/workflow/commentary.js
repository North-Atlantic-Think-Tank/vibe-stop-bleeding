import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { publishArticle } from './publish.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
      model: 'claude-sonnet-4-5-20250929',
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

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const investigationPath = process.argv[2];
  if (!investigationPath) {
    console.error('Usage: npm run workflow:commentary -- path/to/investigation.json');
    console.error('\nExample:');
    console.error('  npm run workflow:commentary -- content/articles/2025-11-23-carney-paradox-rhetoric-reality-gap.json');
    process.exit(1);
  }
  writeCommentary(investigationPath).catch(console.error);
}

export { writeCommentary };
