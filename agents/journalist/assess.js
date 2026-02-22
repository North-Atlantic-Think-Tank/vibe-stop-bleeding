import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Investigative Journalist Agent - Assessment Task
 * Performs initial assessment of a potential investigation trigger
 */
async function assessInvestigation(trigger) {
  const journalistPrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/journalist/prompt.md'),
    'utf-8',
  );

  const assessmentRequest = `Perform an initial assessment (Phase 1) for this potential investigation:

TRIGGER: ${trigger}

Provide your assessment in JSON format:
{
  "investigation_id": "INV-YYYY-XXX",
  "trigger": "Description of the trigger",
  "trigger_type": "statistical_anomaly|data_discrepancy|viral_rumor|chart_pattern|tip|follow_the_money|regulatory_gap",
  "preliminary_analysis": {
    "what_caught_attention": "Specific anomaly or pattern noticed",
    "initial_hypothesis": "What might be happening",
    "potential_scope": "Who could be affected and how",
    "estimated_impact": "high|medium|low"
  },
  "red_flags_identified": ["List of concerning patterns"],
  "key_questions": ["Questions that need answers"],
  "potential_sources": ["Types of sources to consult"],
  "estimated_effort": "days|weeks|months",
  "recommendation": "proceed|monitor|decline",
  "rationale": "Why this recommendation",
  "next_steps": ["Immediate actions if proceeding"]
}`;

  console.log(
    '🔍 Investigative Journalist: Assessing potential investigation...\n',
  );

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: journalistPrompt,
    messages: [
      {
        role: 'user',
        content: assessmentRequest,
      },
    ],
  });

  const response = message.content[0].text;

  // Extract JSON from response
  let assessmentData;
  try {
    const jsonMatch =
      response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      assessmentData = JSON.parse(jsonMatch[1]);
    } else {
      assessmentData = JSON.parse(response);
    }
  } catch (e) {
    console.error('⚠️  Could not parse JSON response. Saving raw output.');
    assessmentData = { raw: response };
  }

  // Save assessment
  const timestamp = new Date().toISOString().split('T')[0];
  const slug = trigger
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 30);
  const outputPath = path.join(
    process.cwd(),
    'content/investigations',
    `assessment-${timestamp}-${slug}.json`,
  );

  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(assessmentData, null, 2));

  console.log('✅ Assessment completed!');
  console.log(`📄 Saved to: ${outputPath}\n`);
  console.log(
    '📊 Recommendation:',
    assessmentData.recommendation || 'See report',
  );
  console.log('\n--- Full Assessment ---\n');
  console.log(JSON.stringify(assessmentData, null, 2));

  return assessmentData;
}

// CLI execution
const trigger = process.argv.slice(2).join(' ');
if (!trigger) {
  console.error(
    'Usage: npm run journalist:assess -- "Description of the anomaly or trigger"',
  );
  console.error(
    '\nExample: npm run journalist:assess -- "Ontario education spending up 20% but class sizes increased"',
  );
  process.exit(1);
}
assessInvestigation(trigger).catch(console.error);

export { assessInvestigation };
