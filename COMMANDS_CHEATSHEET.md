# Commands Cheat Sheet

## Quick Start (First Time)

```bash
npm install                    # Install dependencies
cp .env.example .env          # Create environment file
# Add ANTHROPIC_API_KEY to .env
npm run editor:research       # Test the system
```

## Daily Commands

```bash
npm run workflow:daily        # Full automated cycle
npm run editor:research       # Research topics only
npm run editor:write -- "Topic"  # Write specific article
```

## Agent Commands

| Command | What It Does | Output |
|---------|-------------|--------|
| `npm run editor:research` | Research trending topics | `content/drafts/research-*.md` |
| `npm run editor:research politics` | Research specific category | `content/drafts/research-*.md` |
| `npm run editor:write -- "Topic"` | Write article | `content/articles/*.json` |
| `npm run workflow:daily` | Full automation cycle | Article JSON + logs |
| `npm run workflow:publish -- file.json` | Convert to markdown | Article `.md` file |

## Developer Commands

```bash
node agents/developer/setup.js "Build feature X"
# Outputs implementation plan
```

## Orchestrator (Multi-Agent)

```bash
node agents/shared/orchestrator.js "Complex task description"
# Coordinates multiple agents
```

## File Locations

| Type | Location |
|------|----------|
| Articles (JSON) | `content/articles/*.json` |
| Articles (MD) | `content/articles/*.md` |
| Research | `content/drafts/*.md` |
| Logs | `agents/workflow/log-*.json` |
| Chart Data | `public/data/*-charts.json` |

## Check Results

```bash
ls -lt content/articles/      # List articles
cat content/drafts/*.md       # View research
cat agents/workflow/log-*.json  # View logs
```

## Troubleshooting

```bash
# Check API key
cat .env | grep ANTHROPIC

# Check Node version (need 18+)
node --version

# Test API connection
npm run editor:research
```

## Example Workflows

### Generate Today's Article
```bash
npm run workflow:daily
```

### Write About Specific Topic
```bash
npm run editor:write -- "Canadian budget 2025 analysis"
```

### Publish Article
```bash
npm run workflow:publish -- content/articles/2025-11-14-article.json
```

### Research Then Write
```bash
npm run editor:research
# Review output, choose topic
npm run editor:write -- "Chosen topic from research"
```

## Time Estimates

- Research: 30-90 seconds
- Write article: 60-180 seconds
- Full cycle: 2-4 minutes
- Publish: <5 seconds

## Next Steps

1. ✅ Test: `npm run workflow:daily`
2. 📝 Review output in `content/`
3. 🚀 Build website with Developer Agent
4. ⏰ Set up automation with Scheduler
5. 🌐 Deploy to Vercel/Netlify

---

**Emergency Command**: If stuck, run `npm run editor:research` to test basic functionality.
