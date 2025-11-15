# stopbleeding.ca - AI Agent Team

An AI-powered Canadian news analysis platform using autonomous agents for content creation and website management.

## 🤖 Agent Team Structure

This project uses three specialized AI agents that work together:

### 1. **Editor Agent**
- Researches Canadian news topics
- Writes analysis articles (800-1500 words)
- Provides data-driven insights
- Focuses on: Politics, Economy, Employment, Education

### 2. **Developer Agent**
- Builds and maintains the website
- Implements data visualizations
- Handles deployment and automation
- Tech stack: Astro, React, Tailwind CSS

### 3. **Workflow Coordinator**
- Orchestrates agent collaboration
- Manages daily publishing cycle
- Handles data handoff between agents
- Monitors workflow execution

## 📁 Project Structure

```
vibe-stop-bleeding/
├── agents/
│   ├── editor/
│   │   ├── prompt.md           # Editor agent system prompt
│   │   ├── research.js         # Research trending topics
│   │   └── write.js            # Write full articles
│   ├── developer/
│   │   ├── prompt.md           # Developer agent system prompt
│   │   └── setup.js            # Development tasks
│   ├── workflow/
│   │   ├── prompt.md           # Workflow coordinator prompt
│   │   ├── daily-cycle.js      # Automated daily publishing
│   │   └── publish.js          # Article publishing
│   └── shared/
│       ├── orchestrator.js     # Multi-agent orchestration
│       ├── types.js            # Data schemas
│       ├── data-converter.js   # Format converters
│       └── scheduler.js        # Automated scheduling
├── content/
│   ├── articles/               # Published articles
│   └── drafts/                 # Draft content
├── public/
│   ├── images/                 # Article images
│   └── data/                   # Chart data
├── package.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key (Claude)

### Installation

1. Clone the repository:
```bash
cd /Users/liwenzhi/web/vibe-stop-bleeding
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

## 📖 Usage

### Editor Agent Tasks

#### Research trending topics:
```bash
npm run editor:research
```

#### Research specific category:
```bash
npm run editor:research politics
```

#### Write an article:
```bash
npm run editor:write -- "Canadian employment trends Q1 2025"
```

### Workflow Tasks

#### Run daily publishing cycle:
```bash
npm run workflow:daily
```

This will:
1. Research trending Canadian topics
2. Select top story
3. Write full article with data
4. Save as JSON in `content/articles/`

#### Publish article:
```bash
npm run workflow:publish -- content/articles/2025-11-14-article.json
```

Converts JSON to markdown and prepares for web publishing.

### Multi-Agent Orchestration

For complex tasks requiring multiple agents:

```bash
node agents/shared/orchestrator.js "Research Canadian housing market trends and write an article with charts showing price changes over 3 years"
```

The orchestrator will:
- Analyze the task
- Determine which agents to involve
- Coordinate execution
- Save combined results

## 🔄 Automated Workflows

### Daily Publishing Cycle

The workflow coordinator manages a daily schedule (Eastern Time):

- **9 AM**: Research trending topics
- **11 AM**: Draft article
- **2 PM**: Finalize with data
- **4 PM**: Publish to website
- **6 PM**: Share on social media

### Start Automated Scheduler

```bash
node agents/shared/scheduler.js
```

For production, use cron jobs:
```bash
# Run daily cycle at 9 AM ET
0 9 * * * cd /path/to/project && npm run workflow:daily
```

## 📊 Data Format

Articles use a standardized JSON format:

```json
{
  "title": "Article Title",
  "category": "politics|economy|employment|education",
  "date": "2025-11-14",
  "author": "stopbleeding.ca Editorial Team",
  "summary": "Brief summary",
  "content": "Full markdown content...",
  "charts": [
    {
      "type": "line|bar|pie",
      "title": "Chart Title",
      "data": [...],
      "config": {...}
    }
  ],
  "sources": [
    {"title": "Source Name", "url": "https://..."}
  ],
  "tags": ["tag1", "tag2"],
  "seo": {
    "metaDescription": "...",
    "keywords": [...]
  }
}
```

## 🛠️ Development

### Add New Agent Capabilities

1. Create prompt file: `agents/[agent-name]/prompt.md`
2. Implement execution script: `agents/[agent-name]/script.js`
3. Update orchestrator to include new agent

### Customize Agent Prompts

Edit the prompt files in each agent directory:
- `agents/editor/prompt.md`
- `agents/developer/prompt.md`
- `agents/workflow/prompt.md`

## 📝 Example Workflows

### Create weekly content plan:
```bash
npm run editor:research
# Review output in content/drafts/research-YYYY-MM-DD.md
```

### Write article on specific topic:
```bash
npm run editor:write -- "Impact of new federal budget on Canadian families"
```

### Full end-to-end:
```bash
npm run workflow:daily
```

### Publish existing article:
```bash
npm run workflow:publish -- content/articles/2025-11-14-budget-analysis.json
```

## 🎯 Best Practices

1. **Review AI output**: Always review articles before publishing
2. **Fact-check**: Verify statistics and sources
3. **Backup content**: All content is saved in JSON format
4. **Monitor performance**: Check workflow logs regularly
5. **Update prompts**: Refine agent prompts based on output quality

## 🔐 Security

- Never commit `.env` file
- Keep API keys secure
- Review generated content for accuracy
- Implement content moderation for public sites

## 📚 Additional Resources

- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [Astro Documentation](https://docs.astro.build/)
- [Original prompt document](./stopbleeding_prompts.md)

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Set up API key in `.env`
3. Run first research: `npm run editor:research`
4. Write first article: `npm run editor:write -- "Your topic"`
5. Review output in `content/` directory
6. Build website (see Developer Agent for implementation)

## 📄 License

MIT

## 🤝 Contributing

This is an AI agent system. To improve:
1. Refine agent prompts in `agents/*/prompt.md`
2. Add new capabilities in agent scripts
3. Enhance orchestration logic
4. Improve data formats and validation

---

**Generated by Claude Code** 🤖
