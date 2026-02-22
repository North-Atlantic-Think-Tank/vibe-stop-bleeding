# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

stopbleeding.ca is an AI-powered Canadian news analysis platform built using a **multi-agent system**. The project consists of three autonomous AI agents that collaborate to research, write, and publish Canadian news analysis articles.

## Core Architecture

### Three-Agent System

This is an **agent orchestration project**, not a traditional web application. The agents use Claude API to perform tasks:

1. **Editor Agent** (`agents/editor/`): Researches Canadian news and writes analysis articles (800-1500 words)
2. **Developer Agent** (`agents/developer/`): Plans and implements technical features
3. **Workflow Coordinator** (`agents/workflow/`): Orchestrates multi-agent collaboration and manages publishing pipeline

Each agent has:
- `prompt.md`: System prompt defining the agent's role and capabilities
- Executable scripts that call Claude API with the prompt

### Data Flow

```
User/Cron → Workflow Coordinator → Editor Agent → JSON Article → Data Converter → Markdown/RSS → Website
```

All articles use a **standardized JSON schema** (defined in `agents/shared/types.js`):
- Required: `title`, `category`, `date`, `content`
- Optional: `charts`, `sources`, `tags`, `seo`
- Categories: `politics`, `economy`, `employment`, `education`, `general`

### Key Architectural Patterns

**Agent Prompts as Configuration**: Each agent's behavior is defined by its `prompt.md` file. To modify agent behavior, edit these prompts.

**Data Handoff Format**: Agents communicate via structured JSON. The Editor outputs article JSON, which the Workflow Coordinator converts to markdown/RSS.

**Orchestrator Pattern**: `agents/shared/orchestrator.js` coordinates multi-agent tasks by loading agent prompts and calling Claude API sequentially with context passing.

## Commands

### Setup
```bash
npm install                          # Install dependencies
cp .env.example .env                 # Create .env and add ANTHROPIC_API_KEY
```

### Agent Execution
```bash
npm run editor:research              # Research trending Canadian topics
npm run editor:research [category]   # Research specific category
npm run editor:write -- "Topic"      # Write article on specific topic
npm run workflow:daily               # Full cycle: research → write → save
npm run workflow:publish -- file.json # Convert JSON to markdown
npm run workflow:covergen -- file.json # Generate cover images (all 3 styles)
npm run workflow:covergen -- file.json --style=moderate  # Generate single style

node agents/shared/orchestrator.js "Complex task"  # Multi-agent coordination
node agents/shared/scheduler.js      # Start automated scheduling
```

### Planned Website Commands (not yet implemented)
```bash
npm run dev                          # Development server (Astro)
npm run build                        # Production build
npm run preview                      # Preview build
```

## Working with Agents

### Creating/Modifying Agents

**To modify agent behavior**: Edit `agents/[agent-name]/prompt.md`

**To add new agent capability**:
1. Create new script in `agents/[agent-name]/new-feature.js`
2. Import and use Anthropic SDK with agent's prompt
3. Add npm script to `package.json`
4. Update orchestrator if needed for multi-agent coordination

### Agent Script Pattern

All agent scripts follow this pattern:
```javascript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 1. Load agent prompt from prompt.md
const prompt = await fs.readFile('agents/[agent]/prompt.md', 'utf-8');

// 2. Call Claude API
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4000-8000,
  system: prompt,
  messages: [{ role: 'user', content: task }]
});

// 3. Parse and save output
const response = message.content[0].text;
```

### Data Validation

Use `agents/shared/types.js` functions:
- `validateArticle(data)`: Validates article JSON against schema
- `createArticleTemplate()`: Returns empty article template

Use `agents/shared/data-converter.js` for format conversion:
- `jsonToMarkdown()`: Convert article JSON to markdown
- `markdownToJson()`: Parse markdown to JSON
- `generateRSSFeed()`: Create RSS feed from articles

Use `agents/shared/cover-generator.js` for cover image generation:
- `generateCoverImage(articleData, style)`: Generate single style cover image
- `generateAllCoverVariants(articleData)`: Generate all 3 style variants
- `generateCoverFromArticle(jsonPath)`: Generate from article JSON file

### Cover Image Generation

The platform uses **Stability AI** to generate article cover images in three distinct styles:

**Three Artistic Styles**:
1. **Moderate**: Professional editorial news illustration with balanced composition and muted colors
2. **Aggressive**: Bold dramatic imagery with strong contrast and vibrant colors
3. **Satirical**: Political satire illustration with clever visual metaphors and editorial cartoon style

**API Configuration**:
- Requires `STABILITY_API_KEY` and `STABILITY_API_BASE_URL` in `.env`
- Images generated at 21:9 aspect ratio (closest to 2:1 supported by Stability AI)
- Model: `sd3-large-turbo` for fast high-quality generation

**CLI Usage**:
```bash
# Generate all three styles
npm run workflow:covergen -- content/articles/2025-11-26-article.json

# Generate single style
npm run workflow:covergen -- content/articles/2025-11-26-article.json --style=moderate
npm run workflow:covergen -- content/articles/2025-11-26-article.json --style=aggressive
npm run workflow:covergen -- content/articles/2025-11-26-article.json --style=satirical
```

**Programmatic Usage** (for integration with other workflows):
```javascript
import { generateCoverFromArticle, generateCoverImage } from './agents/shared/cover-generator.js';

// Generate all three styles
const results = await generateCoverFromArticle('path/to/article.json');

// Generate specific style
const result = await generateCoverFromArticle('path/to/article.json', false, 'moderate');

// Or generate from article data directly
const articleData = { title: '...', summary: '...', category: 'politics' };
const result = await generateCoverImage(articleData, 'aggressive');
```

**Output Location**: `public/images/covers/[date]-[slug]-[style].jpeg`

**Automatic Thumbnail Generation**: Cover generation now automatically creates low-resolution thumbnail placeholders (~800 bytes) for optimized lazy loading. Thumbnails are saved to `public/images/thumbnails/` and can also be generated separately using `npm run thumbnails:generate`. See `docs/LAZY_LOADING.md` for details.

## Content Output Locations

- **Article JSON**: `content/articles/*.json` (structured data from Editor)
- **Article Markdown**: `content/articles/*.md` (published format)
- **Research Drafts**: `content/drafts/research-*.md`
- **Workflow Logs**: `agents/workflow/log-*.json`
- **Chart Data**: `public/data/*-charts.json`
- **Cover Images**: `public/images/covers/*-[style].jpeg` (AI-generated article covers)
- **Thumbnails**: `public/images/thumbnails/*-[style].jpg` (Low-res placeholders for lazy loading)

## Canadian Content Focus

This platform specifically targets **Canadian news analysis**:
- Always use Canadian sources (CBC, Globe and Mail, Statistics Canada, National Post)
- Use Canadian spelling and terminology
- Focus on topics: Politics, Economy, Employment, Education
- Articles should be 800-1500 words with data-driven analysis
- Include multiple perspectives and cited sources

## Daily Automation Schedule

The system supports automated daily publishing (Eastern Time):
- **9:00 AM**: Research trending topics
- **11:00 AM**: Select and draft article
- **2:00 PM**: Finalize with data and sources
- **4:00 PM**: Publish content
- **6:00 PM**: Social media distribution (planned)

Use cron or cloud scheduler (Vercel Cron, GitHub Actions) to trigger `npm run workflow:daily`

## Important Implementation Notes

**API Key Required**: All agent scripts require `ANTHROPIC_API_KEY` in `.env`

**Model Selection**: Currently using `claude-sonnet-4-6`. To change models, update in each agent script.

**Token Limits**:
- Research tasks: 4000 tokens
- Article writing: 8000 tokens
- Adjust `max_tokens` based on task complexity

**JSON Parsing**: Editor agent outputs may include markdown code blocks. Scripts use regex to extract JSON:
```javascript
const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/(\{[\s\S]*\})/);
```

**File Naming Convention**: Output files use format: `YYYY-MM-DD-slug.json/md`

## Website Development (Planned)

The website frontend is **not yet implemented**. When building:
- Use Astro + React + Tailwind CSS
- Reference design: https://github.com/nicdun/astro-tech-blog (newspaper style)
- Implement chart components using Recharts
- Read articles from `content/articles/*.md` with frontmatter
- Read chart data from `public/data/*-charts.json`
- Deploy to Vercel or Netlify

## Multi-Agent Orchestration

The `AgentOrchestrator` class coordinates complex tasks:

```javascript
import { AgentOrchestrator } from './agents/shared/orchestrator.js';
const orchestrator = new AgentOrchestrator();

// Run single agent
await orchestrator.runAgent('editor', 'Task description', context);

// Run multi-agent workflow
await orchestrator.runMultiAgentTask('Complex task requiring multiple agents');
```

The orchestrator:
1. Analyzes task to determine required agents
2. Loads appropriate agent prompts
3. Executes agents sequentially with context passing
4. Saves combined results to `agents/workflow/orchestration-*.json`

## Testing Agent Changes

When modifying agents:
1. Test individual agent: `npm run editor:research` or `npm run editor:write -- "test topic"`
2. Check output quality in `content/` directory
3. Verify JSON schema with `validateArticle()`
4. Test full workflow: `npm run workflow:daily`
5. Review logs in `agents/workflow/log-*.json`

## Future Agent Possibilities

The architecture supports additional agents (mentioned in `stopbleeding_prompts.md`):
- **SEO & Analytics Specialist**: Monitor traffic, optimize content
- **Social Media Manager**: Adapt content for social platforms
- **Image Generation Agent**: Create article visuals

To add new agents, follow the existing pattern in `agents/` directory structure.
