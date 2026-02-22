import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';

import { publishArticle } from '../workflow/publish.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Extract text content from a PDF file
 * Uses createRequire to work around pdf-parse ESM import issues
 */
async function extractPDFText(pdfPath) {
  // Use createRequire to import pdf-parse (CommonJS module)
  const require = createRequire(import.meta.url);
  const pdf = require('pdf-parse');

  const dataBuffer = await fs.readFile(pdfPath);
  const data = await pdf(dataBuffer);
  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info,
  };
}

/**
 * Editor Agent - Summary Task
 * Generates a briefing-style summary article from a topic, webpage URL, or local PDF
 * highlighting outstanding facts and data as conclusion
 */
async function generateSummary(input, category = 'general') {
  const editorPrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/editor/prompt.md'),
    'utf-8',
  );

  // Determine input type: URL, PDF, or topic
  const isURL = input.startsWith('http://') || input.startsWith('https://');
  const isPDF = input.endsWith('.pdf') || input.includes('content/pdfs/');

  let inputType = 'topic';
  let pdfContent = null;
  let pdfPath = null;

  if (isURL) {
    inputType = 'webpage URL';
  } else if (isPDF) {
    inputType = 'PDF document';
    // Resolve PDF path - check if it's a full path or just filename
    if (path.isAbsolute(input)) {
      pdfPath = input;
    } else if (input.includes('content/pdfs/')) {
      pdfPath = path.join(process.cwd(), input);
    } else {
      // Assume it's just a filename, look in content/pdfs
      pdfPath = path.join(process.cwd(), 'content/pdfs', input);
    }

    // Extract PDF content
    console.log(`📄 Reading PDF: ${pdfPath}\n`);
    try {
      pdfContent = await extractPDFText(pdfPath);
      console.log(`✅ Extracted ${pdfContent.numPages} pages from PDF\n`);
    } catch (error) {
      console.error(`❌ Failed to read PDF: ${error.message}`);
      throw error;
    }
  }

  let summaryRequest;

  if (isPDF && pdfContent) {
    // Limit text length to avoid token limits (roughly 100k characters)
    const maxChars = 100000;
    const truncatedText =
      pdfContent.text.length > maxChars
        ? pdfContent.text.substring(0, maxChars) +
          '\n\n[... PDF content truncated due to length ...]'
        : pdfContent.text;

    summaryRequest = `Analyze and summarize this PDF document content:

**PDF Information:**
- Pages: ${pdfContent.numPages}
- Title: ${pdfContent.info?.Title || path.basename(pdfPath)}

**PDF Content:**
${truncatedText}

---

Category: ${category}`;
  } else if (isURL) {
    summaryRequest = `Read and analyze the content from this webpage: ${input}

Category: ${category}`;
  } else {
    summaryRequest = `Research and analyze this topic: "${input}"

Category: ${category}`;
  }

  summaryRequest += `

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

  console.log(
    `📋 Editor Agent: Generating briefing summary from ${inputType}...\n`,
  );
  if (isURL) {
    console.log(`🔗 URL: ${input}\n`);
  } else if (isPDF) {
    console.log(`📄 PDF: ${pdfPath}\n`);
  } else {
    console.log(`📝 Topic: "${input}"\n`);
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
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
  let slug;
  if (isURL) {
    slug = new URL(input).hostname.replace(/\./g, '-') + '-summary';
  } else if (isPDF) {
    // Use PDF filename (without extension) as slug
    slug =
      path
        .basename(pdfPath, '.pdf')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') + '-summary';
  } else {
    slug = input.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  slug = slug.substring(0, 50);

  const outputPath = path.join(
    process.cwd(),
    'content/articles',
    `${timestamp}-${slug}.json`,
  );

  await fs.writeFile(outputPath, JSON.stringify(summaryData, null, 2));

  console.log('✅ Briefing summary completed!');
  console.log(`📄 Saved to: ${outputPath}\n`);

  // Validate and fix date property to ensure it's today
  const today = new Date().toISOString().split('T')[0];
  if (summaryData.date && summaryData.date !== today) {
    console.log(
      `⚠️  Date mismatch: Article date is "${summaryData.date}", updating to today "${today}"`,
    );
    summaryData.date = today;
    await fs.writeFile(outputPath, JSON.stringify(summaryData, null, 2));
    console.log('✅ Date corrected to today!');
  } else if (!summaryData.date) {
    console.log(`⚠️  No date found in article, setting to today "${today}"`);
    summaryData.date = today;
    await fs.writeFile(outputPath, JSON.stringify(summaryData, null, 2));
    console.log('✅ Date added!');
  } else {
    console.log(`✅ Date verified: ${summaryData.date}`);
  }

  // Publish to markdown
  try {
    const mdFilePath = await publishArticle(outputPath);
    console.log('✅ Briefing published!');
    console.log(`📄 Published to: ${mdFilePath}\n`);
  } catch (publishError) {
    console.warn('⚠️  Could not auto-publish:', publishError.message);
    console.log(
      '💡 You can manually publish later with: npm run workflow:publish -- ' +
        outputPath,
    );
  }

  return summaryData;
}

// CLI execution
const input = process.argv.slice(2).join(' ');
if (!input) {
  console.error('Usage: npm run editor:summary -- "Topic, URL, or PDF"');
  console.error('');
  console.error('Examples:');
  console.error('  npm run editor:summary -- "Canadian inflation trends 2024"');
  console.error(
    '  npm run editor:summary -- "https://www.cbc.ca/news/politics/..."',
  );
  console.error(
    '  npm run editor:summary -- "budget-2025.pdf"  (from content/pdfs/)',
  );
  console.error('  npm run editor:summary -- "content/pdfs/report.pdf"');
  process.exit(1);
}

generateSummary(input).catch(console.error);

export { generateSummary };
