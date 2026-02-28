import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Chief Executive Agent - MP Performance Evaluation
 * Evaluates a Member of Parliament's performance based on evidence
 */
async function evaluateMP(mpName, context = '') {
  const executivePrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/chief-executive/prompt.md'),
    'utf-8',
  );

  // Gather existing intelligence from articles and investigations
  let intelligence = '';
  try {
    const articlesDir = path.join(process.cwd(), 'content/articles');
    const files = await fs.readdir(articlesDir);
    const relevantFiles = files.filter(f => f.endsWith('.json') || f.endsWith('.md'));

    for (const file of relevantFiles.slice(-20)) {
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
    // No articles directory yet
  }

  // Check investigations too
  try {
    const investigationsDir = path.join(process.cwd(), 'content/investigations');
    const files = await fs.readdir(investigationsDir);
    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const content = await fs.readFile(path.join(investigationsDir, file), 'utf-8');
        if (content.toLowerCase().includes(mpName.toLowerCase())) {
          intelligence += `\n--- From investigation ${file} ---\n${content.substring(0, 3000)}\n`;
        }
      } catch (e) {
        // Skip unreadable files
      }
    }
  } catch (e) {
    // No investigations directory yet
  }

  const evaluationRequest = `Conduct a thorough performance evaluation of the following Member of Parliament:

MP NAME: ${mpName}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ''}

${intelligence ? `INTELLIGENCE FROM STOPBLEEDING.CA:\n${intelligence}\n` : ''}

Evaluate this MP using your full evaluation framework (8 criteria, each scored 1-10). Research their publicly available record including:
- House of Commons attendance and participation
- Bills introduced and voting record
- Committee work
- Constituency service
- Public statements and conduct
- Campaign promises vs. actions taken
- Handling of key issues affecting Canadians

Output your evaluation as a complete JSON document following the MP Evaluation Report format specified in your prompt. Include specific evidence for each score, clear recommendations, and determine whether any action is required.

Be thorough, fair, and evidence-based. Acknowledge strengths even if the overall assessment is negative.`;

  console.log(`📋 Chief Executive: Evaluating MP "${mpName}"...\n`);
  console.log('⏳ Conducting thorough performance review...\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 12000,
    system: executivePrompt,
    messages: [
      {
        role: 'user',
        content: evaluationRequest,
      },
    ],
  });

  const response = message.content[0].text;

  // Extract JSON from response
  let evaluationData;
  try {
    const jsonMatch =
      response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      evaluationData = JSON.parse(jsonMatch[1]);
    } else {
      evaluationData = JSON.parse(response);
    }
  } catch (e) {
    console.error('⚠️  Could not parse JSON response. Saving raw output.');
    evaluationData = { raw: response };
  }

  // Save evaluation
  const year = new Date().getFullYear();
  const slug = mpName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 40);
  const outputPath = path.join(
    process.cwd(),
    'content/evaluations',
    `${year}-${slug}-evaluation.json`,
  );

  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(evaluationData, null, 2));

  console.log('✅ Evaluation completed!');
  console.log(`📄 Report saved to: ${outputPath}\n`);

  // Display summary
  console.log('--- Evaluation Summary ---\n');
  if (evaluationData.mp_name) {
    console.log(`👤 MP: ${evaluationData.mp_name}`);
  }
  if (evaluationData.riding) {
    console.log(`📍 Riding: ${evaluationData.riding}`);
  }
  if (evaluationData.party) {
    console.log(`🏛️  Party: ${evaluationData.party}`);
  }
  if (evaluationData.overall_score) {
    console.log(`📊 Overall Score: ${evaluationData.overall_score}/10`);
  }
  if (evaluationData.overall_rating) {
    console.log(`📝 Rating: ${evaluationData.overall_rating}`);
  }
  if (evaluationData.action_required && evaluationData.action_required !== 'none') {
    console.log(`⚠️  Action Required: ${evaluationData.action_required.toUpperCase()}`);
  }
  if (evaluationData.summary) {
    console.log(`\n📌 Summary: ${evaluationData.summary}`);
  }
  if (evaluationData.concerns && evaluationData.concerns.length > 0) {
    console.log('\n🔴 Key Concerns:');
    evaluationData.concerns.forEach((concern, i) => {
      console.log(`   ${i + 1}. ${concern}`);
    });
  }

  return evaluationData;
}

// CLI execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    'Usage: npm run executive:evaluate -- "MP Name" [optional context]',
  );
  console.error('\nExamples:');
  console.error(
    '  npm run executive:evaluate -- "Justin Trudeau"',
  );
  console.error(
    '  npm run executive:evaluate -- "Pierre Poilievre" "Focus on housing policy positions"',
  );
  process.exit(1);
}

const mpName = args[0];
const context = args.slice(1).join(' ');
evaluateMP(mpName, context).catch(console.error);

export { evaluateMP };
