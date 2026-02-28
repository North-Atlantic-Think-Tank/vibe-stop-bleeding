# Getting Started — stopbleeding.ca AI Agent Team

## Agent Team Overview

The platform consists of 6 AI agents that collaborate to research, write, investigate, evaluate, and publish Canadian news analysis and MP accountability content:

| Agent | Purpose | Key Commands |
|-------|---------|--------------|
| **Chief Executive** | MP evaluation & accountability actions | `executive:evaluate`, `executive:action`, `executive:annual-report` |
| **Editor** | News research & article writing | `editor:research`, `editor:write`, `editor:summary` |
| **Journalist** | Deep-dive investigations | `journalist:investigate`, `journalist:assess` |
| **International Journalist** | Global impact investigations | `intl:investigate` |
| **Developer** | Website features & technical work | `node agents/developer/setup.js` |
| **Workflow Coordinator** | Orchestration & publishing | `workflow:daily`, `workflow:publish`, `workflow:covergen` |

## Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up API Key
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Test the System
```bash
npm run editor:research
```

### 4. Generate First Article
```bash
npm run workflow:daily
```

### 5. Check Output
```bash
ls content/articles/
```

## Common Commands

### Content Creation
```bash
npm run editor:research                    # Research trending Canadian topics
npm run editor:research economy            # Research specific category
npm run editor:write -- "Your topic here"  # Write article on topic
npm run workflow:daily                     # Full automated cycle
npm run workflow:publish -- path/to.json   # Publish article JSON to markdown
npm run workflow:covergen -- path/to.json  # Generate cover images
```

### Investigations
```bash
npm run journalist:investigate -- "Topic"       # Canadian investigation
npm run journalist:assess                       # Assess investigation triggers
npm run intl:investigate -- "Topic"             # International investigation
```

### MP Accountability
```bash
npm run executive:evaluate -- "MP Name"                            # Evaluate MP performance
npm run executive:evaluate -- "MP Name" "Focus on housing policy"  # Evaluate with context
npm run executive:action -- "MP Name" --type=statement             # Public statement
npm run executive:action -- "MP Name" --type=letter                # Open letter to MP
npm run executive:action -- "MP Name" --type=resignation_demand    # Demand resignation
npm run executive:action -- "MP Name" --type=accountability_report # Voter dossier
npm run executive:annual-report -- 2025                            # Annual report card
```

### Multi-Agent Orchestration
```bash
node agents/shared/orchestrator.js "Complex task requiring multiple agents"
```

## Output Locations

| Content | Location |
|---------|----------|
| Article JSON | `content/articles/*.json` |
| Article Markdown | `content/articles/*.md` |
| Research Drafts | `content/drafts/*.md` |
| MP Evaluations | `content/evaluations/*.json` |
| Action Documents | `content/actions/*.json` |
| Investigations | `content/investigations/*.json` |
| Workflow Logs | `agents/workflow/log-*.json` |
| Chart Data | `public/data/*-charts.json` |
| Cover Images | `public/images/covers/*-[style].jpeg` |
| Thumbnails | `public/images/thumbnails/*-[style].jpg` |

## Daily Automation Schedule

| Time (ET) | Activity |
|-----------|----------|
| 9:00 AM | Research trending topics |
| 11:00 AM | Select top story and draft |
| 2:00 PM | Finalize article with data |
| 4:00 PM | Publish to website |
| 6:00 PM | Share on social media (planned) |

Use cron or cloud scheduler to trigger `npm run workflow:daily`.

## Typical Workflows

### Write and Publish an Article
```bash
npm run editor:research
# Review content/drafts/research-*.md, pick a topic
npm run editor:write -- "Chosen topic"
npm run workflow:publish -- content/articles/latest.json
```

### Investigate and Hold an MP Accountable
```bash
npm run journalist:investigate -- "MP voting record on housing"
npm run executive:evaluate -- "MP Name"
# Review content/evaluations/ for the rating
npm run executive:action -- "MP Name" --type=letter
```

### Generate Year-End Report
```bash
# After evaluating MPs throughout the year
npm run executive:annual-report -- 2025
```

## Next Steps

1. Run `npm run workflow:daily` to test the full pipeline
2. Review output in `content/`
3. Customize agent prompts in `agents/*/prompt.md`
4. Evaluate an MP with `npm run executive:evaluate -- "MP Name"`
5. Set up automation with the scheduler
6. Deploy to production

## Tips

- Always review AI-generated content before publishing
- Verify sources and statistics
- Customize agent prompts in `agents/*/prompt.md` for better results
- Monitor API usage and costs
- Check workflow logs for debugging: `agents/workflow/log-*.json`

## Troubleshooting

**API key issues**:
```bash
grep ANTHROPIC_API_KEY .env
```

**Test basic functionality**:
```bash
npm run editor:research
```

**View workflow logs**:
```bash
ls agents/workflow/log-*.json
```

**Invalid evaluation data**:
Check output against the evaluation schema in `agents/shared/types.js`.

## Documentation

- `CLAUDE.md` — Project instructions and architecture
- `AGENT_GUIDE.md` — Detailed agent reference and workflow patterns
- `ARCHITECTURE.md` — System architecture
- `COMMANDS_CHEATSHEET.md` — Quick command reference
- `QUICKSTART.md` — 5-minute setup guide
- `TEST_COMMANDS.md` — Testing guide
