import { researchTopics } from '../editor/research.js';
import { writeArticle } from '../editor/write.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Daily Publishing Cycle
 * Orchestrates the full workflow from research to article creation
 */
async function runDailyCycle() {
  console.log('🚀 Starting Daily Publishing Cycle\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Research
    console.log('\n📋 STEP 1: Research Phase');
    console.log('-'.repeat(60));
    const research = await researchTopics();

    // Parse research to extract first topic suggestion
    const topicMatch = research.match(/\*\*(.+?)\*\*/) || research.match(/1\.\s*(.+?)(\n|$)/);
    const suggestedTopic = topicMatch ? topicMatch[1] : null;

    if (!suggestedTopic) {
      console.log('\n⚠️  Could not extract topic from research. Please review research output and run editor:write manually.');
      return;
    }

    console.log(`\n✅ Research complete. Suggested topic: "${suggestedTopic}"`);

    // Step 2: Write Article
    console.log('\n📋 STEP 2: Writing Phase');
    console.log('-'.repeat(60));
    const article = await writeArticle(suggestedTopic);

    // Step 3: Log completion
    console.log('\n📋 STEP 3: Completion');
    console.log('-'.repeat(60));

    const log = {
      timestamp: new Date().toISOString(),
      cycle: 'daily',
      research: {
        completed: true,
        topic: suggestedTopic,
      },
      article: {
        completed: true,
        title: article.title || 'Unknown',
        category: article.category || 'general',
      },
    };

    const logPath = path.join(
      process.cwd(),
      'agents/workflow',
      `log-${new Date().toISOString().split('T')[0]}.json`
    );

    await fs.writeFile(logPath, JSON.stringify(log, null, 2));

    console.log('\n✅ Daily cycle completed successfully!');
    console.log(`📄 Log saved to: ${logPath}`);
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during daily cycle:', error.message);
    process.exit(1);
  }
}

runDailyCycle().catch(console.error);

export { runDailyCycle };
