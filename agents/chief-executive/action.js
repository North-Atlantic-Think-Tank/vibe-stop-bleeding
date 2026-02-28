import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VALID_TYPES = ['statement', 'letter', 'resignation_demand', 'accountability_report'];

/**
 * Chief Executive Agent - Action Execution
 * Generates formal action documents based on MP evaluations
 */
async function executeAction(mpName, actionType = 'letter', context = '') {
  if (!VALID_TYPES.includes(actionType)) {
    console.error(`Invalid action type: "${actionType}"`);
    console.error(`Valid types: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }

  const executivePrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/chief-executive/prompt.md'),
    'utf-8',
  );

  // Look for existing evaluation
  let evaluationContext = '';
  try {
    const evalDir = path.join(process.cwd(), 'content/evaluations');
    const files = await fs.readdir(evalDir);
    const slug = mpName.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40);
    const evalFile = files.find(f => f.includes(slug) && f.includes('evaluation'));
    if (evalFile) {
      const evalContent = await fs.readFile(path.join(evalDir, evalFile), 'utf-8');
      evaluationContext = `\nEXISTING EVALUATION:\n${evalContent}\n`;
    }
  } catch (e) {
    // No evaluation found
  }

  // Gather intelligence from articles and investigations
  let intelligence = '';
  try {
    const articlesDir = path.join(process.cwd(), 'content/articles');
    const files = await fs.readdir(articlesDir);
    for (const file of files.filter(f => f.endsWith('.json')).slice(-20)) {
      try {
        const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
        if (content.toLowerCase().includes(mpName.toLowerCase())) {
          intelligence += `\n--- From ${file} ---\n${content.substring(0, 2000)}\n`;
        }
      } catch (e) {
        // Skip unreadable files
      }
    }
  } catch (e) {
    // No articles directory
  }

  const typeDescriptions = {
    statement: 'a formal public statement highlighting concerns about this MP\'s performance',
    letter: 'a detailed open letter addressed directly to this MP demanding explanation and improvement',
    resignation_demand: 'a formal letter calling for this MP to resign from their position, citing specific failures and evidence',
    accountability_report: 'a comprehensive accountability dossier documenting this MP\'s failures to inform voters',
  };

  const actionRequest = `Generate ${typeDescriptions[actionType]} for the following Member of Parliament:

MP NAME: ${mpName}
ACTION TYPE: ${actionType}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ''}
${evaluationContext}
${intelligence ? `INTELLIGENCE FROM STOPBLEEDING.CA:\n${intelligence}\n` : ''}

Write this ${actionType.replace('_', ' ')} following the Action Document format in your prompt. The document must be:
- Evidence-based with specific citations
- Respectful but firm and uncompromising
- Clear about what failures have occurred
- Specific about demands or expectations
- Proportionate to the severity of the failures

Output the complete action document as JSON following your Action Document schema.`;

  console.log(`⚡ Chief Executive: Preparing ${actionType.replace('_', ' ')} for MP "${mpName}"...\n`);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 12000,
    system: executivePrompt,
    messages: [
      {
        role: 'user',
        content: actionRequest,
      },
    ],
  });

  const response = message.content[0].text;

  // Extract JSON from response
  let actionData;
  try {
    const jsonMatch =
      response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      actionData = JSON.parse(jsonMatch[1]);
    } else {
      actionData = JSON.parse(response);
    }
  } catch (e) {
    console.error('⚠️  Could not parse JSON response. Saving raw output.');
    actionData = { raw: response };
  }

  // Save action document
  const timestamp = new Date().toISOString().split('T')[0];
  const slug = mpName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 40);
  const outputPath = path.join(
    process.cwd(),
    'content/actions',
    `${timestamp}-${slug}-${actionType}.json`,
  );

  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(actionData, null, 2));

  console.log('✅ Action document generated!');
  console.log(`📄 Saved to: ${outputPath}\n`);

  // Display summary
  console.log(`--- ${actionType.replace('_', ' ').toUpperCase()} Summary ---\n`);
  if (actionData.subject) {
    console.log(`📌 Subject: ${actionData.subject}`);
  }
  if (actionData.mp_name) {
    console.log(`👤 To: ${actionData.mp_name}`);
  }
  if (actionData.demands && actionData.demands.length > 0) {
    console.log('\n📋 Demands:');
    actionData.demands.forEach((demand, i) => {
      console.log(`   ${i + 1}. ${demand}`);
    });
  }
  if (actionData.deadline) {
    console.log(`\n⏰ Response Deadline: ${actionData.deadline}`);
  }
  if (actionData.follow_up) {
    console.log(`\n➡️  Follow-up: ${actionData.follow_up}`);
  }

  return actionData;
}

// CLI execution
const args = process.argv.slice(2);

// Parse --type flag
let actionType = 'letter';
const filteredArgs = [];
for (const arg of args) {
  if (arg.startsWith('--type=')) {
    actionType = arg.split('=')[1];
  } else {
    filteredArgs.push(arg);
  }
}

if (filteredArgs.length === 0) {
  console.error(
    'Usage: npm run executive:action -- "MP Name" --type=letter|statement|resignation_demand|accountability_report [context]',
  );
  console.error('\nExamples:');
  console.error(
    '  npm run executive:action -- "MP Name" --type=letter',
  );
  console.error(
    '  npm run executive:action -- "MP Name" --type=resignation_demand "Based on housing policy failures"',
  );
  console.error(
    '  npm run executive:action -- "MP Name" --type=statement',
  );
  process.exit(1);
}

const mpName = filteredArgs[0];
const context = filteredArgs.slice(1).join(' ');
executeAction(mpName, actionType, context).catch(console.error);

export { executeAction };
