import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

import { publishArticle } from '../workflow/publish.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Editor Agent - Writing Task
 * Writes a full article based on a topic
 */
async function writeArticle(topic, category = 'general') {
  const editorPrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/editor/prompt.md'),
    'utf-8',
  );

  const writeRequest = `Research and write a comprehensive article about: "${topic}"

Category: ${category}

Follow all guidelines in your prompt. Output the article in JSON format matching the data handoff schema:
{
  "title": "...",
  "category": "politics|economy|employment|education",
  "date": "YYYY-MM-DD",
  "author": "stopbleeding.ca Editorial Team",
  "summary": "...",
  "content": "... (markdown) ...",
  "charts": [...],
  "sources": [...],
  "tags": [...],
  "seo": {...}
}`;

  console.log(`✍️  Editor Agent: Writing article about "${topic}"...\n`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8000,
    system: editorPrompt,
    messages: [
      {
        role: 'user',
        content: writeRequest,
      },
    ],
  });

  const response = message.content[0].text;

  // Extract JSON from response (handle markdown code blocks)
  let articleData;
  try {
    const jsonMatch =
      response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      articleData = JSON.parse(jsonMatch[1]);
    } else {
      articleData = JSON.parse(response);
    }
  } catch (e) {
    console.error('⚠️  Could not parse JSON response. Saving raw output.');
    articleData = { raw: response };
  }

  // Save article
  const timestamp = new Date().toISOString().split('T')[0];
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 50);
  const outputPath = path.join(
    process.cwd(),
    'content/articles',
    `${timestamp}-${slug}.json`,
  );

  await fs.writeFile(outputPath, JSON.stringify(articleData, null, 2));

  console.log('✅ Article completed!');
  console.log(`📄 Saved to: ${outputPath}\n`);

  // also do publish - @2025/11/15
  const mdFilePath = await publishArticle(outputPath);

  console.log('✅ Article published!');
  console.log(`📄 Saved to: ${mdFilePath}\n`);

  return articleData;
}

// CLI execution
const topic = process.argv.slice(2).join(' ');
if (!topic) {
  console.error('Usage: npm run editor:write -- "Your article topic here"');
  process.exit(1);
}
writeArticle(topic).catch(console.error);

export { writeArticle };
