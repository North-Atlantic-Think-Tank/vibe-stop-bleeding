# Agent Team Guide

Detailed guide for working with the stopbleeding.ca AI agent team.

## Understanding the Agents

### Editor Agent
**Purpose**: Content creation and research
**Capabilities**:
- Web research on Canadian topics
- Article writing (800-1500 words)
- Data analysis and visualization planning
- Source citation and fact-checking
- SEO optimization

**When to use**:
- Need article ideas
- Want to write about specific topic
- Require analysis of Canadian data
- Need research on trending topics

### Developer Agent
**Purpose**: Technical implementation
**Capabilities**:
- Website development (Astro/React)
- Data visualization implementation
- Deployment automation
- Performance optimization
- Feature development

**When to use**:
- Building website features
- Implementing charts/visualizations
- Setting up infrastructure
- Deploying to production
- Technical problem-solving

### Workflow Coordinator
**Purpose**: Agent orchestration
**Capabilities**:
- Multi-agent task planning
- Data handoff management
- Schedule coordination
- Error handling and logging
- Quality assurance

**When to use**:
- Complex tasks requiring multiple agents
- Automated publishing workflows
- Coordinating research + development
- Scheduled content creation

## Agent Communication Flow

```
User Request
    ↓
Workflow Coordinator (analyzes task)
    ↓
├─→ Editor Agent (content creation)
│       ↓
│   JSON Article Data
│       ↓
└─→ Developer Agent (implementation)
        ↓
    Published Content
```

## Customizing Agents

### Modifying Agent Behavior

Edit the prompt files to change agent behavior:

**agents/editor/prompt.md**:
```markdown
# Add specific guidelines
- Focus more on data-driven analysis
- Include comparison with international trends
- Use more visual metaphors
```

**agents/developer/prompt.md**:
```markdown
# Specify technical preferences
- Prefer TypeScript over JavaScript
- Use specific chart library (e.g., Recharts)
- Follow specific code style guide
```

### Adding Agent Capabilities

1. **Create new agent script**:
```javascript
// agents/editor/analyze-sentiment.js
import Anthropic from '@anthropic-ai/sdk';

export async function analyzeSentiment(text) {
  // Implementation
}
```

2. **Update orchestrator** to recognize new capability

3. **Add npm script** to `package.json`:
```json
{
  "scripts": {
    "editor:sentiment": "node agents/editor/analyze-sentiment.js"
  }
}
```

## Data Schemas

### Article Schema
See `agents/shared/types.js` for full TypeScript definitions.

Required fields:
- `title`: string
- `category`: politics | economy | employment | education
- `date`: YYYY-MM-DD format
- `content`: markdown string

Optional but recommended:
- `charts`: array of chart data
- `sources`: array of source references
- `seo`: SEO metadata

### Chart Schema
```javascript
{
  type: 'line' | 'bar' | 'pie' | 'area',
  title: string,
  data: Array<{x, y}>,
  config: {
    xAxis: { label: string },
    yAxis: { label: string },
    // ... other config
  }
}
```

## Workflow Patterns

### Pattern 1: Quick Article
```bash
# One command to write and publish
npm run editor:write -- "Topic" && \
npm run workflow:publish -- content/articles/latest.json
```

### Pattern 2: Research-Driven Content
```bash
# 1. Research
npm run editor:research

# 2. Review research output
cat content/drafts/research-*.md

# 3. Write based on findings
npm run editor:write -- "Chosen topic from research"
```

### Pattern 3: Automated Daily
```bash
# Single command for full cycle
npm run workflow:daily
```

### Pattern 4: Complex Multi-Agent
```bash
# Orchestrator handles complexity
node agents/shared/orchestrator.js \
  "Research Canadian housing crisis, write article with 5-year price trend charts, and create implementation plan for interactive map"
```

## Error Handling

### Common Issues

**API Key Not Found**:
```
Error: ANTHROPIC_API_KEY not set
```
Solution: Check `.env` file exists and contains valid key

**Invalid Article Data**:
```
Error: Missing required fields
```
Solution: Check article JSON against schema in `types.js`

**Agent Output Parsing Error**:
```
Error: Could not parse JSON response
```
Solution: Review agent prompt, ensure it outputs valid JSON

### Debugging

Enable verbose logging:
```javascript
// Add to agent script
console.log('Agent input:', input);
console.log('Agent output:', output);
```

Check workflow logs:
```bash
cat agents/workflow/log-*.json
```

## Best Practices

### 1. Prompt Engineering
- Be specific in agent instructions
- Provide context and examples
- Iterate on prompts based on output quality

### 2. Content Review
- Always review AI-generated content
- Verify sources and statistics
- Check for bias and balance

### 3. Version Control
- Commit agent prompts
- Track prompt changes
- Document modifications

### 4. Testing
- Test agents individually first
- Then test orchestration
- Review outputs before automation

### 5. Monitoring
- Check logs regularly
- Monitor API usage
- Track content quality metrics

## Advanced Usage

### Chain Multiple Agents
```javascript
import { AgentOrchestrator } from './agents/shared/orchestrator.js';

const orchestrator = new AgentOrchestrator();

// Custom workflow
const research = await orchestrator.runAgent('editor', 'Research X');
const article = await orchestrator.runAgent('editor', 'Write about X', { research });
const implementation = await orchestrator.runAgent('developer', 'Build feature for X', { article });
```

### Custom Scheduling
```javascript
import { startScheduler } from './agents/shared/scheduler.js';

// Check every 30 minutes
startScheduler(30);
```

### Parallel Agent Execution
```javascript
// Run multiple agents simultaneously
const [research1, research2] = await Promise.all([
  orchestrator.runAgent('editor', 'Research politics'),
  orchestrator.runAgent('editor', 'Research economy'),
]);
```

## Integration Examples

### With GitHub Actions
```yaml
# .github/workflows/daily-content.yml
name: Daily Content Generation
on:
  schedule:
    - cron: '0 13 * * *'  # 9 AM ET
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run workflow:daily
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### With Vercel Cron
```json
// vercel.json
{
  "crons": [{
    "path": "/api/daily-cycle",
    "schedule": "0 9 * * *"
  }]
}
```

## Troubleshooting

**Agent not responding**:
1. Check API key validity
2. Verify network connection
3. Check Anthropic service status

**Poor quality output**:
1. Refine agent prompt
2. Provide more context
3. Add examples to prompt
4. Adjust model parameters

**Workflow coordination issues**:
1. Check data handoff format
2. Validate JSON schemas
3. Review orchestrator logs

## Resources

- Agent prompts: `agents/*/prompt.md`
- Type definitions: `agents/shared/types.js`
- Example outputs: `content/articles/`
- Workflow logs: `agents/workflow/`

---

Need help? Review the main [README.md](./README.md) or check agent prompt files for detailed instructions.
