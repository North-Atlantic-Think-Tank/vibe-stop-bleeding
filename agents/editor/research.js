import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Editor Agent - Research Task
 * Researches Canadian news topics and generates article ideas
 */
async function researchTopics(focusArea = null) {
  const editorPrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/editor/prompt.md'),
    'utf-8'
  );

  const researchRequest = focusArea
    ? `Research trending topics in ${focusArea} for Canadian audiences. Provide 5 article ideas with rationale.`
    : `Research trending Canadian news across politics, economy, employment, and education. Provide 5 diverse article ideas.`;

  console.log('🔍 Editor Agent: Starting research...\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    system: editorPrompt,
    messages: [
      {
        role: 'user',
        content: researchRequest,
      },
    ],
  });

  const response = message.content[0].text;

  // Save research output
  const timestamp = new Date().toISOString().split('T')[0];
  const outputPath = path.join(
    process.cwd(),
    'content/drafts',
    `research-${timestamp}.md`
  );

  await fs.writeFile(outputPath, response);

  console.log('✅ Research completed!');
  console.log(`📄 Saved to: ${outputPath}\n`);
  console.log(response);

  return response;
}

// CLI execution
const focusArea = process.argv[2];
researchTopics(focusArea).catch(console.error);

export { researchTopics };
