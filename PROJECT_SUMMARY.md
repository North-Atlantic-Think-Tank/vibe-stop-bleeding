# stopbleeding.ca AI Agent Team - Project Summary

## What Was Created

A complete AI agent system for stopbleeding.ca with three autonomous agents that collaborate to create and publish Canadian news analysis content.

## Project Structure

```
vibe-stop-bleeding/
├── agents/
│   ├── editor/           → Content research & writing
│   ├── developer/        → Technical implementation
│   ├── workflow/         → Coordination & scheduling
│   └── shared/           → Common utilities
├── content/
│   ├── articles/         → Published articles (JSON & MD)
│   └── drafts/           → Research & drafts
├── public/
│   ├── images/           → Article images
│   └── data/             → Chart data files
└── docs/                 → Documentation
```

## The Three Agents

### 1. Editor Agent
**Files**:
- `agents/editor/prompt.md` - System prompt defining capabilities
- `agents/editor/research.js` - Research Canadian news topics
- `agents/editor/write.js` - Write full articles with data

**What it does**:
- Monitors Canadian news sources
- Identifies trending topics
- Writes 800-1500 word analysis articles
- Provides data for visualizations
- Cites sources and facts

### 2. Developer Agent
**Files**:
- `agents/developer/prompt.md` - System prompt for development
- `agents/developer/setup.js` - Development task execution

**What it does**:
- Builds website features
- Implements data visualizations
- Handles deployment
- Optimizes performance
- Creates technical documentation

### 3. Workflow Coordinator
**Files**:
- `agents/workflow/prompt.md` - Coordination prompt
- `agents/workflow/daily-cycle.js` - Automated daily publishing
- `agents/workflow/publish.js` - Article publishing

**What it does**:
- Coordinates agent collaboration
- Manages daily schedule
- Handles data handoff
- Monitors execution
- Logs activities

## Shared Utilities

**orchestrator.js** - Multi-agent task coordination
**types.js** - Data schemas and validation
**data-converter.js** - JSON ↔ Markdown conversion, RSS generation
**scheduler.js** - Automated scheduling system

## Key Features

### 1. Automated Content Creation
```bash
npm run workflow:daily
```
Fully automated: Research → Write → Publish

### 2. Individual Agent Control
```bash
npm run editor:research        # Research topics
npm run editor:write -- "Topic"  # Write article
```

### 3. Multi-Agent Orchestration
```bash
node agents/shared/orchestrator.js "Complex task"
```
Automatically coordinates multiple agents

### 4. Data Format Standardization
All articles use consistent JSON schema with:
- Metadata (title, date, category)
- Content (markdown)
- Charts (structured data)
- Sources (citations)
- SEO (keywords, description)

### 5. Publishing Pipeline
JSON → Markdown → RSS → Website

## Usage Examples

### Research trending topics:
```bash
npm run editor:research
# Output: content/drafts/research-YYYY-MM-DD.md
```

### Write article:
```bash
npm run editor:write -- "Canadian job market trends"
# Output: content/articles/YYYY-MM-DD-canadian-job-market-trends.json
```

### Publish article:
```bash
npm run workflow:publish -- content/articles/2025-11-14-article.json
# Output: content/articles/2025-11-14-article.md
```

### Full automated cycle:
```bash
npm run workflow:daily
# Runs complete research → write → save workflow
```

## Daily Automated Schedule

- **9 AM ET**: Research trending topics
- **11 AM ET**: Draft article
- **2 PM ET**: Finalize with data
- **4 PM ET**: Publish content
- **6 PM ET**: Share on social media

## Data Flow

```
User/Schedule
    ↓
Workflow Coordinator
    ↓
Editor Agent (research)
    ↓
Editor Agent (write)
    ↓
Article JSON
    ↓
Publisher (convert to markdown)
    ↓
Website / RSS Feed
```

## Configuration

### Required:
1. Install dependencies: `npm install`
2. Set API key in `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### Optional:
- Customize agent prompts in `agents/*/prompt.md`
- Adjust schedule in `agents/shared/scheduler.js`
- Modify data schema in `agents/shared/types.js`

## Documentation

- **README.md** - Full documentation and usage
- **QUICKSTART.md** - 5-minute setup guide
- **AGENT_GUIDE.md** - Detailed agent reference
- **stopbleeding_prompts.md** - Original requirements

## Next Steps

1. **Install & Configure**
   ```bash
   npm install
   cp .env.example .env
   # Add ANTHROPIC_API_KEY
   ```

2. **Test Editor Agent**
   ```bash
   npm run editor:research
   ```

3. **Generate First Article**
   ```bash
   npm run editor:write -- "Your topic"
   ```

4. **Run Full Workflow**
   ```bash
   npm run workflow:daily
   ```

5. **Build Website**
   Use Developer Agent to implement Astro site based on:
   https://github.com/nicdun/astro-tech-blog

6. **Deploy**
   Set up on Vercel/Netlify with:
   - Automated daily content generation
   - RSS feed generation
   - Social media sharing

## Technical Stack

- **AI Model**: Claude Sonnet 4.5 (via Anthropic API)
- **Runtime**: Node.js 18+
- **Planned Frontend**: Astro + React + Tailwind CSS
- **Data Format**: JSON + Markdown
- **Deployment**: Vercel/Netlify (planned)

## Key Advantages

1. **Autonomous**: Agents work independently
2. **Coordinated**: Workflow orchestration
3. **Extensible**: Easy to add capabilities
4. **Structured**: Consistent data formats
5. **Documented**: Comprehensive guides
6. **Automated**: Scheduled workflows

## Customization

### Add New Agent Capability:
1. Create script in `agents/[agent]/new-capability.js`
2. Add npm script to `package.json`
3. Update orchestrator if needed

### Modify Agent Behavior:
Edit prompt files: `agents/*/prompt.md`

### Change Schedule:
Edit: `agents/shared/scheduler.js`

## Limitations & Considerations

1. **Review required**: AI output should be fact-checked
2. **API costs**: Monitor Claude API usage
3. **Source verification**: Always verify statistics
4. **Bias checking**: Review for balanced coverage
5. **Legal compliance**: Add disclaimers about AI content

## Success Metrics

Track:
- Articles published per day
- Content quality scores
- Source diversity
- Topic coverage balance
- Reader engagement (once live)

## Support

- Check documentation in `/docs`
- Review agent prompts for capabilities
- Examine example outputs in `content/articles/`
- Review workflow logs in `agents/workflow/`

---

**Status**: ✅ Agent team fully configured and ready to use

**Created**: November 14, 2025

**Next Action**: Install dependencies and run first research cycle
