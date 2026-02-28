import 'dotenv/config';

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Chief Executive Agent - Annual Report Generator
 * Aggregates MP evaluations and produces a comprehensive annual report card
 */
async function generateAnnualReport(year) {
  const executivePrompt = await fs.readFile(
    path.join(process.cwd(), 'agents/chief-executive/prompt.md'),
    'utf-8',
  );

  // Gather all evaluations for the year
  let evaluations = [];
  try {
    const evalDir = path.join(process.cwd(), 'content/evaluations');
    const files = await fs.readdir(evalDir);
    const yearFiles = files.filter(f => f.startsWith(String(year)) && f.includes('evaluation') && f.endsWith('.json'));

    for (const file of yearFiles) {
      try {
        const content = await fs.readFile(path.join(evalDir, file), 'utf-8');
        const data = JSON.parse(content);
        evaluations.push(data);
      } catch (e) {
        console.warn(`⚠️  Could not parse ${file}, skipping.`);
      }
    }
  } catch (e) {
    // No evaluations directory
  }

  // Gather actions taken during the year
  let actions = [];
  try {
    const actionsDir = path.join(process.cwd(), 'content/actions');
    const files = await fs.readdir(actionsDir);
    const yearFiles = files.filter(f => f.startsWith(String(year)) && f.endsWith('.json'));

    for (const file of yearFiles) {
      try {
        const content = await fs.readFile(path.join(actionsDir, file), 'utf-8');
        const data = JSON.parse(content);
        actions.push(data);
      } catch (e) {
        // Skip unreadable files
      }
    }
  } catch (e) {
    // No actions directory
  }

  // Gather key articles from the year for context
  let articleSummaries = '';
  try {
    const articlesDir = path.join(process.cwd(), 'content/articles');
    const files = await fs.readdir(articlesDir);
    const yearFiles = files.filter(f => f.startsWith(String(year)) && f.endsWith('.json'));

    for (const file of yearFiles.slice(-30)) {
      try {
        const content = await fs.readFile(path.join(articlesDir, file), 'utf-8');
        const data = JSON.parse(content);
        if (data.title && data.category) {
          articleSummaries += `- ${data.title} (${data.category}, ${data.date})\n`;
        }
      } catch (e) {
        // Skip
      }
    }
  } catch (e) {
    // No articles directory
  }

  const reportRequest = `Generate the comprehensive Annual MP Performance Report Card for ${year}.

EXISTING EVALUATIONS (${evaluations.length} MPs evaluated):
${evaluations.length > 0 ? JSON.stringify(evaluations, null, 2) : 'No individual evaluations have been completed yet. Generate a report based on publicly available information about Canadian MPs\' performance during ' + year + '.'}

ACTIONS TAKEN DURING ${year} (${actions.length} actions):
${actions.length > 0 ? JSON.stringify(actions, null, 2) : 'No formal actions have been taken yet.'}

KEY ARTICLES PUBLISHED ON STOPBLEEDING.CA:
${articleSummaries || 'No articles available for reference.'}

Generate the complete Annual Report following your Annual Report JSON schema. The report should:
1. Rank MPs evaluated (or notable MPs if no evaluations exist yet)
2. Identify top performers and worst performers
3. Analyse trends by party and province
4. Highlight key issues that defined the year for Canadians
5. Summarise actions taken and their outcomes
6. Provide an outlook for the coming year
7. Include methodology notes

Be comprehensive, fair, and data-driven. This is the definitive annual assessment of how Canada's elected representatives served their constituents.

Output as complete JSON following the Annual Report schema.`;

  console.log(`📊 Chief Executive: Generating ${year} Annual MP Performance Report...\n`);
  console.log('⏳ Compiling evaluations and preparing comprehensive report...\n');

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    system: executivePrompt,
    messages: [
      {
        role: 'user',
        content: reportRequest,
      },
    ],
  });

  const response = message.content[0].text;

  // Extract JSON from response
  let reportData;
  try {
    const jsonMatch =
      response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      reportData = JSON.parse(jsonMatch[1]);
    } else {
      reportData = JSON.parse(response);
    }
  } catch (e) {
    console.error('⚠️  Could not parse JSON response. Saving raw output.');
    reportData = { raw: response };
  }

  // Save annual report
  const outputPath = path.join(
    process.cwd(),
    'content/evaluations',
    `${year}-annual-report.json`,
  );

  // Ensure directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(reportData, null, 2));

  console.log('✅ Annual report generated!');
  console.log(`📄 Report saved to: ${outputPath}\n`);

  // Display summary
  console.log(`--- ${year} Annual Report Summary ---\n`);
  if (reportData.executive_summary) {
    console.log(`📌 ${reportData.executive_summary}\n`);
  }
  if (reportData.trends && reportData.trends.average_score) {
    console.log(`📊 National Average Score: ${reportData.trends.average_score}/10`);
  }
  if (reportData.top_performers && reportData.top_performers.length > 0) {
    console.log('\n🏆 Top Performers:');
    reportData.top_performers.forEach((mp, i) => {
      console.log(`   ${i + 1}. ${mp}`);
    });
  }
  if (reportData.worst_performers && reportData.worst_performers.length > 0) {
    console.log('\n🔴 Worst Performers:');
    reportData.worst_performers.forEach((mp, i) => {
      console.log(`   ${i + 1}. ${mp}`);
    });
  }
  if (reportData.actions_taken && reportData.actions_taken.length > 0) {
    console.log('\n⚡ Actions Taken:');
    reportData.actions_taken.forEach((action, i) => {
      console.log(`   ${i + 1}. ${action}`);
    });
  }
  if (reportData.outlook) {
    console.log(`\n🔮 Outlook: ${reportData.outlook}`);
  }

  return reportData;
}

// CLI execution
const args = process.argv.slice(2);
if (args.length === 0) {
  const currentYear = new Date().getFullYear();
  console.log(`No year specified, defaulting to ${currentYear - 1}\n`);
  generateAnnualReport(currentYear - 1).catch(console.error);
} else {
  const year = parseInt(args[0], 10);
  if (isNaN(year) || year < 2000 || year > 2100) {
    console.error('Usage: npm run executive:annual-report -- <year>');
    console.error('\nExamples:');
    console.error('  npm run executive:annual-report -- 2025');
    console.error('  npm run executive:annual-report -- 2024');
    process.exit(1);
  }
  generateAnnualReport(year).catch(console.error);
}

export { generateAnnualReport };
