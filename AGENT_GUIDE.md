# Agent Team Guide

Detailed guide for working with the stopbleeding.ca AI agent team.

## Understanding the Agents

### Chief Executive (`agents/chief-executive/`)
**Purpose**: Top leader and action executor — MP accountability
**Capabilities**:
- Evaluate MP performance using 8 objective criteria (scored 1-10)
- Issue formal action documents (public statements, open letters, resignation demands, accountability reports)
- Generate annual MP performance report cards
- Synthesise intelligence from journalists and editors into actionable conclusions

**When to use**:
- Evaluating an MP's performance record
- Taking formal action against underperforming MPs
- Producing annual or periodic accountability reports
- Making decisions based on journalist investigations and editor analysis

**Commands**:
```bash
npm run executive:evaluate -- "MP Name"                         # Evaluate MP
npm run executive:evaluate -- "MP Name" "Focus on housing"      # Evaluate with context
npm run executive:action -- "MP Name" --type=letter             # Open letter
npm run executive:action -- "MP Name" --type=resignation_demand # Resignation demand
npm run executive:action -- "MP Name" --type=statement          # Public statement
npm run executive:action -- "MP Name" --type=accountability_report  # Voter dossier
npm run executive:annual-report -- 2025                         # Annual report card
```

### Editor Agent (`agents/editor/`)
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

### Journalist Agent (`agents/journalist/`)
**Purpose**: Deep-dive investigative journalism
**Capabilities**:
- Full investigation methodology (5 phases)
- Evidence assembly and verification
- Source development and protection
- Data analysis and pattern detection
- Investigation report generation

**When to use**:
- Statistical anomalies or data discrepancies need investigation
- Following money trails or suspicious spending
- Verifying or debunking viral claims
- Exposing government or corporate wrongdoing
- Providing evidence for Chief Executive evaluations

**Commands**:
```bash
npm run journalist:investigate -- "Topic"          # Full investigation
npm run journalist:assess                          # Assess triggers
```

### International Journalist (`agents/intljournalist/`)
**Purpose**: International investigations affecting Canada
**Capabilities**:
- Global trade and geopolitical analysis
- State-sponsored market interference detection
- WTO violations analysis
- Cross-border economic impact assessment

**When to use**:
- Investigating international impacts on Canadian interests
- Trade disputes, economic coercion, or sanctions analysis
- Providing global context for Chief Executive evaluations

**Commands**:
```bash
npm run intl:investigate -- "Topic"                # International investigation
```

### Developer Agent (`agents/developer/`)
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

### Workflow Coordinator (`agents/workflow/`)
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
├─→ Journalist Agent (investigation)
│       ↓
│   Investigation Report JSON ──────────┐
│                                       ↓
├─→ Editor Agent (content creation)  Chief Executive (evaluation & action)
│       ↓                               ↓
│   JSON Article Data              Evaluation / Action JSON
│       ↓                               ↓
└─→ Developer Agent (impl.)       Published on stopbleeding.ca
        ↓
    Published Content
```

### Chief Executive Decision Flow
```
Journalist Investigation ─┐
Editor Analysis ──────────┤
International Reports ────┤
Public Record (Hansard) ──┘
        ↓
Chief Executive: Evaluate MP (8 criteria, score 1-10)
        ↓
Rating: A | B | C | D | F
        ↓
┌─ A/B: Acknowledge good performance
├─ C:   Note areas for improvement
├─ D:   Public statement → Open letter
└─ F:   Resignation demand → Accountability report
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
See `agents/shared/types.js` for full definitions.

Required fields:
- `title`: string
- `category`: politics | economy | employment | education | general
- `date`: YYYY-MM-DD format
- `content`: markdown string

Optional but recommended:
- `charts`: array of chart data
- `sources`: array of source references
- `seo`: SEO metadata

### MP Evaluation Schema
See `agents/shared/types.js` — `validateEvaluation()` and `createEvaluationTemplate()`.

Required fields:
- `mp_name`: string — Full name of the MP
- `date`: YYYY-MM-DD format
- `scores`: object — 8 criteria each scored 1-10
- `overall_rating`: A | B | C | D | F

Score criteria:
- `attendance_participation`, `legislative_effectiveness`, `constituency_service`
- `alignment_with_canadian_interests`, `fiscal_responsibility`, `transparency_ethics`
- `public_conduct`, `crisis_response`

Optional but recommended:
- `riding`, `province`, `party`, `evaluation_period`
- `findings`: detailed per-criterion evidence
- `concerns`, `recommendations`
- `action_required`: none | statement | letter | resignation_demand | accountability_report
- `sources`: evidence references

### Action Document Schema
- `type`: statement | open_letter | resignation_demand | accountability_report
- `mp_name`, `riding`, `party`, `date`
- `subject`: brief subject line
- `content`: full text in markdown
- `basis`: evaluation reference, key failures, evidence summary
- `demands`: specific demands or expectations
- `deadline`: response deadline
- `follow_up`: consequences of inaction

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

### Pattern 4: MP Accountability Pipeline
```bash
# 1. Investigate MP's record
npm run journalist:investigate -- "MP Name voting record on housing"

# 2. Evaluate based on evidence
npm run executive:evaluate -- "MP Name"

# 3. Review evaluation output
cat content/evaluations/2025-mp-name-evaluation.json

# 4. Take action if warranted
npm run executive:action -- "MP Name" --type=letter
```

### Pattern 5: Annual Review Cycle
```bash
# 1. Evaluate key MPs throughout the year
npm run executive:evaluate -- "MP Name 1"
npm run executive:evaluate -- "MP Name 2"

# 2. Generate annual report at year end
npm run executive:annual-report -- 2025
```

### Pattern 6: Complex Multi-Agent
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

// Custom content workflow
const research = await orchestrator.runAgent('editor', 'Research X');
const article = await orchestrator.runAgent('editor', 'Write about X', { research });
const implementation = await orchestrator.runAgent('developer', 'Build feature for X', { article });

// Custom accountability workflow
const investigation = await orchestrator.runAgent('journalist', 'Investigate MP voting record');
const evaluation = await orchestrator.runAgent('chief-executive', 'Evaluate MP based on investigation', { investigation });
const action = await orchestrator.runAgent('chief-executive', 'Write open letter based on evaluation', { evaluation });
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
- Article outputs: `content/articles/`
- MP evaluations: `content/evaluations/`
- Action documents: `content/actions/`
- Investigations: `content/investigations/`
- Workflow logs: `agents/workflow/`

---

Need help? Review the main [README.md](./README.md) or check agent prompt files for detailed instructions.
