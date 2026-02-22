import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Developer Agent - Setup Task
 * Generates implementation plans and code for development tasks
 */
async function developFeature(featureDescription) {
  const developerPrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/developer/prompt.md'),
    'utf-8'
  );

  console.log(`🛠️  Developer Agent: Working on "${featureDescription}"...\n`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: developerPrompt,
    messages: [
      {
        role: 'user',
        content: featureDescription,
      },
    ],
  });

  const response = message.content[0].text;

  // Save implementation plan
  const timestamp = new Date().toISOString().split('T')[0];
  const slug = featureDescription.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
  const outputPath = path.join(
    process.cwd(),
    'agents/developer',
    `plan-${timestamp}-${slug}.md`
  );

  await fs.writeFile(outputPath, response);

  console.log('✅ Development plan completed!');
  console.log(`📄 Saved to: ${outputPath}\n`);
  console.log(response);

  return response;
}

// CLI execution
const feature = process.argv.slice(2).join(' ');
if (!feature) {
  console.error('Usage: node agents/developer/setup.js "Feature description"');
  process.exit(1);
}
developFeature(feature).catch(console.error);

export { developFeature };
