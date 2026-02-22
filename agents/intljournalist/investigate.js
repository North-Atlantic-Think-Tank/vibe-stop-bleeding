import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * International Investigative Journalist Agent - Investigation Task
 * Conducts investigations into international market interference,
 * trade disputes, and geopolitical economic coercion
 */
async function conductInternationalInvestigation(topic, context = '') {
  const journalistPrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/intljournalist/prompt.md'),
    'utf-8',
  );

  const investigationRequest = `Conduct a comprehensive international investigation on the following topic:

INVESTIGATION TOPIC: ${topic}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ''}

Follow your complete investigation methodology (Phases 1-5) and produce a thorough investigation report.

Output your findings in the full JSON format specified in your prompt, including:
- investigation_id
- title
- region
- countries_involved
- trigger
- status
- priority
- investigation_type
- hypothesis
- cases (with detailed documentation of each incident)
- pattern_analysis
- economic_impact
- geopolitical_context
- international_response
- legal_analysis
- key_findings
- article (full markdown investigation report, 2000-3000 words)
- data_visualizations
- sources
- methodology
- future_outlook
- next_steps
- public_tips

Be thorough, evidence-based, and ensure all claims are defensible. Include specific data points, timeline, and clear documentation of your methodology. Document patterns of behavior, not just isolated incidents.`;

  console.log(
    `🌍 International Investigative Journalist: Beginning investigation into "${topic}"...\n`,
  );
  console.log(
    '⏳ This may take several minutes for thorough international research...\n',
  );

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
    .substring(0, 50);
  const outputPath = path.join(
    process.cwd(),
    'content/international-investigations',
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
      'content/international-articles',
      `${timestamp}-${slug}.md`,
    );

    // Ensure directory exists
    await fs.mkdir(path.dirname(mdPath), { recursive: true });

    const frontmatter = `---
title: "${investigationData.title || topic}"
date: "${timestamp}"
category: "international-investigation"
region: "${investigationData.region || 'Global'}"
countries: ${JSON.stringify(investigationData.countries_involved || [])}
investigation_type: "${
      investigationData.investigation_type || 'market_interference'
    }"
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
  if (investigationData.region) {
    console.log(`🌍 Region: ${investigationData.region}`);
  }
  if (investigationData.countries_involved) {
    console.log(
      `🏴 Countries Involved: ${investigationData.countries_involved.join(
        ', ',
      )}`,
    );
  }
  if (investigationData.investigation_type) {
    console.log(`🔍 Type: ${investigationData.investigation_type}`);
  }
  if (investigationData.priority) {
    console.log(`⚠️  Priority: ${investigationData.priority.toUpperCase()}`);
  }
  if (investigationData.cases && investigationData.cases.length > 0) {
    console.log(`\n📋 Cases Documented: ${investigationData.cases.length}`);
    investigationData.cases.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.description?.substring(0, 80)}...`);
    });
  }
  if (investigationData.key_findings) {
    console.log('\n🔑 Key Findings:');
    investigationData.key_findings.forEach((finding, i) => {
      console.log(`   ${i + 1}. ${finding}`);
    });
  }
  if (investigationData.economic_impact) {
    console.log('\n💰 Economic Impact:');
    if (investigationData.economic_impact.direct_losses) {
      console.log(
        `   Direct Losses: ${investigationData.economic_impact.direct_losses}`,
      );
    }
    if (investigationData.economic_impact.affected_industries) {
      console.log(
        `   Affected Industries: ${investigationData.economic_impact.affected_industries.join(
          ', ',
        )}`,
      );
    }
  }
  if (investigationData.future_outlook) {
    console.log('\n🔮 Future Outlook:');
    if (investigationData.future_outlook.escalation_risk) {
      console.log(
        `   Escalation Risk: ${investigationData.future_outlook.escalation_risk.toUpperCase()}`,
      );
    }
    if (investigationData.future_outlook.business_recommendations) {
      console.log(
        `   Recommendations: ${investigationData.future_outlook.business_recommendations}`,
      );
    }
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
    'Usage: npm run intl:investigate -- "Investigation topic" [optional context]',
  );
  console.error('\nExamples:');
  console.error(
    '  npm run intl:investigate -- "China\'s administrative interference in Japanese cultural events"',
  );
  console.error(
    '  npm run intl:investigate -- "Trade pledge gaps in US-China soybean deal"',
  );
  console.error(
    '  npm run intl:investigate -- "Mandatory domestic chip requirements" "Focus on impact to foreign semiconductor companies"',
  );
  process.exit(1);
}

const topic = args[0];
const context = args.slice(1).join(' ');
conductInternationalInvestigation(topic, context).catch(console.error);

export { conductInternationalInvestigation };
