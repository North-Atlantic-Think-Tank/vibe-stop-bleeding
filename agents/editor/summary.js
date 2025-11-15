import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

import { publishArticle } from '../workflow/publish.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Editor Agent - Summary Task
 * Generates a briefing-style summary article from a topic or webpage URL
 * highlighting outstanding facts and data as conclusion
 */
async function generateSummary(input, category = 'general') {
  const editorPrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/editor/prompt.md'),
    'utf-8',
  );

  // Determine if input is a URL or topic
  const isURL = input.startsWith('http://') || input.startsWith('https://');
  const inputType = isURL ? 'webpage URL' : 'topic';

  const summaryRequest = `${isURL ? `Read and analyze the content from this webpage: ${input}` : `Research and analyze this topic: "${input}"`}

Category: ${category}

**Task**: Create a BRIEFING-STYLE summary article that:
1. Highlights the most outstanding and important facts
2. Extracts key data points and statistics
3. Presents findings in a concise, executive summary format (400-800 words)
4. Concludes with clear takeaways and actionable insights
5. Uses bullet points and structured formatting for readability

**Format Requirements**:
- Start with a brief context (1-2 sentences)
- List 5-7 key facts or findings
- Include relevant data/statistics with sources
- End with 3-5 clear conclusions or implications
- Maintain professional, objective tone
- Cite all sources

Output the briefing in JSON format matching the data handoff schema:
{
  "title": "Briefing: [Topic/Source Name]",
  "category": "politics|economy|employment|education|general",
  "date": "YYYY-MM-DD",
  "author": "stopbleeding.ca Editorial Team",
  "summary": "One-sentence overview of the briefing",
  "content": "... (markdown with structured briefing format) ...",
  "charts": [...] (if applicable),
  "sources": [...] (all references),
  "tags": [...],
  "seo": {...}
}`;

  console.log(`📋 Editor Agent: Generating briefing summary from ${inputType}...\n`);
  if (isURL) {
    console.log(`🔗 URL: ${input}\n`);
  } else {
    console.log(`📝 Topic: "${input}"\n`);
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 6000,
    system: editorPrompt,
    messages: [
      {
        role: 'user',
        content: summaryRequest,
      },
    ],
  });

  const response = message.content[0].text;

  // Extract JSON from response (handle markdown code blocks)
  let summaryData;
  try {
    const jsonMatch =
      response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      summaryData = JSON.parse(jsonMatch[1]);
    } else {
      summaryData = JSON.parse(response);
    }
  } catch (e) {
    console.error('⚠️  Could not parse JSON response. Saving raw output.');
    summaryData = { raw: response };
  }

  // Save summary
  const timestamp = new Date().toISOString().split('T')[0];
  const slug = (isURL
    ? new URL(input).hostname.replace(/\./g, '-') + '-summary'
    : input.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  ).substring(0, 50);

  const outputPath = path.join(
    process.cwd(),
    'content/articles',
    `${timestamp}-${slug}.json`,
  );

  await fs.writeFile(outputPath, JSON.stringify(summaryData, null, 2));

  console.log('✅ Briefing summary completed!');
  console.log(`📄 Saved to: ${outputPath}\n`);

  // Publish to markdown
  try {
    const mdFilePath = await publishArticle(outputPath);
    console.log('✅ Briefing published!');
    console.log(`📄 Published to: ${mdFilePath}\n`);
  } catch (publishError) {
    console.warn('⚠️  Could not auto-publish:', publishError.message);
    console.log('💡 You can manually publish later with: npm run workflow:publish -- ' + outputPath);
  }

  return summaryData;
}

// CLI execution
const input = process.argv.slice(2).join(' ');
if (!input) {
  console.error('Usage: npm run editor:summary -- "Topic or URL"');
  console.error('');
  console.error('Examples:');
  console.error('  npm run editor:summary -- "Canadian inflation trends 2024"');
  console.error('  npm run editor:summary -- "https://www.cbc.ca/news/politics/..."');
  process.exit(1);
}

generateSummary(input).catch(console.error);

export { generateSummary };
