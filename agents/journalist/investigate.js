import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Investigative Journalist Agent - Full Investigation Task
 * Conducts a complete investigation and produces a detailed report
 */
async function conductInvestigation(topic, context = '') {
  const journalistPrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/journalist/prompt.md'),
    'utf-8',
  );

  const investigationRequest = `Conduct a full investigation on the following topic:

INVESTIGATION TOPIC: ${topic}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ''}

Follow your complete investigation methodology (Phases 1-5) and produce a comprehensive investigation report.

Output your findings in the full JSON format specified in your prompt, including:
- investigation_id
- title
- trigger
- status
- priority
- hypothesis
- key_findings
- evidence
- impact
- subjects
- article (full markdown investigation report)
- data_visualizations
- sources
- next_steps
- public_tips

Be thorough, evidence-based, and ensure all claims are defensible. Include specific data points, timeline, and clear documentation of your methodology.`;

  console.log(
    `🕵️  Investigative Journalist: Beginning investigation into "${topic}"...\n`,
  );
  console.log('⏳ This may take a few minutes for thorough research...\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: journalistPrompt,
    messages: [
      {
        role: 'user',
        content: investigationRequest,
      },
    ],
  });

  const response = message.content[0].text;

  // Extract JSON from response
  let investigationData;
  try {
    const jsonMatch =
      response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      investigationData = JSON.parse(jsonMatch[1]);
    } else {
      investigationData = JSON.parse(response);
    }
  } catch (e) {
    console.error('⚠️  Could not parse JSON response. Saving raw output.');
    investigationData = { raw: response };
  }

  // Save investigation
  const timestamp = new Date().toISOString().split('T')[0];
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 40);
  const outputPath = path.join(
    process.cwd(),
    'content/investigations',
    `investigation-${timestamp}-${slug}.json`,
  );

  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(investigationData, null, 2));

  console.log('✅ Investigation completed!');
  console.log(`📄 Full report saved to: ${outputPath}\n`);

  // If there's an article, also save it as markdown
  if (investigationData.article) {
    const mdPath = path.join(
      process.cwd(),
      'content/articles',
      `${timestamp}-investigation-${slug}.md`,
    );

    const frontmatter = `---
title: "${investigationData.title || topic}"
date: "${timestamp}"
category: "investigation"
tags: ${JSON.stringify(investigationData.tags || ['investigation'])}
priority: "${investigationData.priority || 'medium'}"
status: "${investigationData.status || 'completed'}"
---

`;

    await fs.writeFile(mdPath, frontmatter + investigationData.article);
    console.log(`📰 Article published to: ${mdPath}\n`);
  }

  // Display summary
  console.log('--- Investigation Summary ---\n');
  if (investigationData.title) {
    console.log(`📌 Title: ${investigationData.title}`);
  }
  if (investigationData.priority) {
    console.log(`⚠️  Priority: ${investigationData.priority.toUpperCase()}`);
  }
  if (investigationData.key_findings) {
    console.log('\n🔑 Key Findings:');
    investigationData.key_findings.forEach((finding, i) => {
      console.log(`   ${i + 1}. ${finding}`);
    });
  }
  if (investigationData.next_steps) {
    console.log('\n➡️  Next Steps:', investigationData.next_steps);
  }

  return investigationData;
}

// CLI execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    'Usage: npm run journalist:investigate -- "Investigation topic" [optional context]',
  );
  console.error('\nExamples:');
  console.error(
    '  npm run journalist:investigate -- "Ontario education funding discrepancies"',
  );
  console.error(
    '  npm run journalist:investigate -- "Housing affordability crisis" "Focus on Toronto and Vancouver"',
  );
  process.exit(1);
}

const topic = args[0];
const context = args.slice(1).join(' ');
conductInvestigation(topic, context).catch(console.error);

export { conductInvestigation };
