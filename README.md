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
│   │   ├── write.js            # Write full articles
│   │   └── summary.js          # Generate briefing summaries
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
│   ├── images/
│   │   ├── covers/             # AI-generated cover images (3 styles per article)
│   │   └── thumbnails/         # Low-res placeholders for lazy loading
│   └── data/                   # Chart data
├── package.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key (Claude)
- Stability AI API key (for cover image generation - optional)

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
# Edit .env and add your API keys:
# - ANTHROPIC_API_KEY (required for all agent tasks)
# - STABILITY_API_KEY (optional, for cover image generation)
# - STABILITY_API_BASE_URL (optional, defaults to Stability AI endpoint)
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

#### Generate a briefing summary:
```bash
# From a topic
npm run editor:summary -- "Canadian inflation trends 2024"

# From a webpage URL
npm run editor:summary -- "https://www.cbc.ca/news/politics/..."

# Summarize a PDF by filename (from content/pdfs/)
npm run editor:summary -- "budget-2025-our-plan.pdf"
```

#### Investigation Usage Examples:
```bash
# Assess a potential investigation
npm run journalist:assess -- "Ontario education spending up 20% but class sizes increased"

# Conduct a full investigation
npm run journalist:investigate -- "Housing affordability crisis" "Focus on Toronto and Vancouver"

# Investigate viral claims
npm run journalist:investigate -- "Major retailer replacing permanent staff with TFWs"
```


This generates a concise briefing-style article (400-800 words) highlighting key facts, data, and conclusions from either a topic or webpage URL.

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

> After one article wrote down, do two things below:

#### Generate cover images and thumbnails:
```bash
# Generate all three artistic styles (moderate, aggressive, satirical)
npm run workflow:covergen -- content/articles/2025-11-14-article.json

# Generate all styles (explicit)
npm run workflow:covergen -- content/articles/2025-11-14-article.json --all

# Generate single style only
npm run workflow:covergen -- content/articles/2025-11-14-article.json --style=moderate
npm run workflow:covergen -- content/articles/2025-11-14-article.json --style=aggressive
npm run workflow:covergen -- content/articles/2025-11-14-article.json --style=satirical
```

#### Publish one article with cover & thumbnails generation:
```bash
npm run publish -- content/articles/2025-11-14-article.json
```


#### Publish article by manual selection:(2025/12/07)
Alternatively use a more convenient way(arrow selection manually):
```bash
npm run publish
```

Converts JSON to markdown and prepares for web publishing.


This will:
1. Generate AI-powered cover images using Stability AI in requested style(s)
2. Automatically create low-resolution thumbnail placeholders for lazy loading
3. Save cover images to `public/images/covers/` (JPEG format, 21:9 aspect ratio)
4. Save thumbnails to `public/images/thumbnails/` (~800 bytes each)
5. Update article JSON with satirical cover path in `seo.ogImage` field

**Three Artistic Styles:**
- **Moderate**: Professional editorial illustration with balanced composition
- **Aggressive**: Bold dramatic imagery with strong contrast and vibrant colors
- **Satirical**: Political satire illustration with clever visual metaphors (used as default og:image)

**Requirements:** Requires `STABILITY_API_KEY` and `STABILITY_API_BASE_URL` in `.env` file.

#### Write editorial commentary:
```bash
npm run workflow:commentary -- content/articles/investigation.json
```

Generates an editorial commentary article based on a journalist investigation. This will:
1. Read the investigation JSON file
2. Use the Editor-in-Chief agent to write commentary (800-1500 words)
3. Provide editorial perspective and analysis on the findings
4. Save as new JSON with "editorial" tags
5. Publish to markdown format

Example:
```bash
npm run workflow:commentary -- content/articles/2025-11-23-carney-paradox-rhetoric-reality-gap.json
```

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
    "keywords": [...],
    "ogImage": "..."
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

### Generate quick briefing from news article:
```bash
npm run editor:summary -- "https://www.cbc.ca/news/business/inflation-report-latest"
```

### Generate briefing on trending topic:
```bash
npm run editor:summary -- "Bank of Canada interest rate decision December 2024"
```

### Full end-to-end:
```bash
npm run workflow:daily
```

### Publish existing article:
```bash
npm run workflow:publish -- content/articles/2025-11-14-budget-analysis.json
```

### Generate cover images for article:
```bash
# Generate all three styles with thumbnails
npm run workflow:covergen -- content/articles/2025-11-14-budget-analysis.json

# Or generate only satirical style
npm run workflow:covergen -- content/articles/2025-11-14-budget-analysis.json --style=satirical
```

### Write editorial commentary on investigation:
```bash
npm run workflow:commentary -- content/articles/2025-11-23-carney-paradox-rhetoric-reality-gap.json
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
5. Or generate a quick briefing: `npm run editor:summary -- "Your topic or URL"`
6. Review output in `content/` directory
7. Build website (see Developer Agent for implementation)

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
