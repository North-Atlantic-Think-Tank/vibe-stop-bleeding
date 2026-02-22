import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Agent Orchestrator
 * Coordinates multiple agents to complete complex tasks
 */
class AgentOrchestrator {
  constructor() {
    this.agents = {
      editor: null,
      developer: null,
      workflow: null,
    };
  }

  async loadAgentPrompts() {
    this.agents.editor = await fs.readFile(
      path.join(process.cwd(), 'agents/editor/prompt.md'),
      'utf-8'
    );
    this.agents.developer = await fs.readFile(
      path.join(process.cwd(), 'agents/developer/prompt.md'),
      'utf-8'
    );
    this.agents.workflow = await fs.readFile(
      path.join(process.cwd(), 'agents/workflow/prompt.md'),
      'utf-8'
    );
  }

  async runAgent(agentType, task, context = {}) {
    if (!this.agents[agentType]) {
      await this.loadAgentPrompts();
    }

    console.log(`\n🤖 Running ${agentType} agent...`);
    console.log(`📋 Task: ${task}\n`);

    const systemPrompt = this.agents[agentType];
    const contextInfo = Object.keys(context).length > 0
      ? `\n\nContext from previous agents:\n${JSON.stringify(context, null, 2)}`
      : '';

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: task + contextInfo,
        },
      ],
    });

    const response = message.content[0].text;
    console.log(`✅ ${agentType} agent completed\n`);

    return response;
  }

  async runMultiAgentTask(taskDescription) {
    console.log('🚀 Multi-Agent Task Orchestration\n');
    console.log('='.repeat(60));
    console.log(`Task: ${taskDescription}\n`);

    const results = {
      task: taskDescription,
      timestamp: new Date().toISOString(),
      agents: {},
    };

    try {
      // Phase 1: Planning with Workflow Coordinator
      const plan = await this.runAgent(
        'workflow',
        `Create a detailed execution plan for this task: "${taskDescription}".
        Specify which agents (editor/developer) need to be involved and in what order.`
      );
      results.agents.workflow = { phase: 'planning', output: plan };

      // Phase 2: Determine if Editor is needed
      if (taskDescription.toLowerCase().includes('article') ||
          taskDescription.toLowerCase().includes('research') ||
          taskDescription.toLowerCase().includes('write')) {

        const editorOutput = await this.runAgent(
          'editor',
          taskDescription,
          results.agents
        );
        results.agents.editor = { phase: 'execution', output: editorOutput };
      }

      // Phase 3: Determine if Developer is needed
      if (taskDescription.toLowerCase().includes('website') ||
          taskDescription.toLowerCase().includes('build') ||
          taskDescription.toLowerCase().includes('implement') ||
          taskDescription.toLowerCase().includes('feature')) {

        const developerOutput = await this.runAgent(
          'developer',
          taskDescription,
          results.agents
        );
        results.agents.developer = { phase: 'execution', output: developerOutput };
      }

      // Save results
      const timestamp = new Date().toISOString().split('T')[0];
      const slug = taskDescription.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40);
      const outputPath = path.join(
        process.cwd(),
        'agents/workflow',
        `orchestration-${timestamp}-${slug}.json`
      );

      await fs.writeFile(outputPath, JSON.stringify(results, null, 2));

      console.log('\n' + '='.repeat(60));
      console.log('✅ Multi-agent task completed!');
      console.log(`📄 Results saved to: ${outputPath}\n`);

      return results;

    } catch (error) {
      console.error('\n❌ Error during orchestration:', error.message);
      throw error;
    }
  }
}

// CLI execution
async function main() {
  const task = process.argv.slice(2).join(' ');
  if (!task) {
    console.error('Usage: node agents/shared/orchestrator.js "Your complex task here"');
    process.exit(1);
  }

  const orchestrator = new AgentOrchestrator();
  await orchestrator.runMultiAgentTask(task);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AgentOrchestrator };
