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
npm run workflow:daily           # Full automated cycle
npm run editor:research          # Research topics only
npm run editor:write -- "Topic"  # Write specific article
```

## Agent Commands

### Editor
| Command | What It Does | Output |
|---------|-------------|--------|
| `npm run editor:research` | Research trending topics | `content/drafts/research-*.md` |
| `npm run editor:research politics` | Research specific category | `content/drafts/research-*.md` |
| `npm run editor:write -- "Topic"` | Write article | `content/articles/*.json` |
| `npm run editor:summary` | Generate article summary | Summary output |

### Journalist
| Command | What It Does | Output |
|---------|-------------|--------|
| `npm run journalist:investigate -- "Topic"` | Full investigation | `content/investigations/*.json` |
| `npm run journalist:assess` | Assess investigation triggers | Trigger assessment |
| `npm run intl:investigate -- "Topic"` | International investigation | `content/investigations/*.json` |

### Chief Executive
| Command | What It Does | Output |
|---------|-------------|--------|
| `npm run executive:evaluate -- "MP Name"` | Evaluate MP performance | `content/evaluations/*.json` |
| `npm run executive:evaluate -- "MP Name" "context"` | Evaluate with specific focus | `content/evaluations/*.json` |
| `npm run executive:action -- "MP Name" --type=statement` | Public statement | `content/actions/*.json` |
| `npm run executive:action -- "MP Name" --type=letter` | Open letter to MP | `content/actions/*.json` |
| `npm run executive:action -- "MP Name" --type=resignation_demand` | Demand resignation | `content/actions/*.json` |
| `npm run executive:action -- "MP Name" --type=accountability_report` | Accountability dossier | `content/actions/*.json` |
| `npm run executive:annual-report -- 2025` | Annual MP report card | `content/evaluations/*.json` |

### Workflow
| Command | What It Does | Output |
|---------|-------------|--------|
| `npm run workflow:daily` | Full automation cycle | Article JSON + logs |
| `npm run workflow:publish -- file.json` | Convert to markdown | Article `.md` file |
| `npm run workflow:covergen -- file.json` | Generate all 3 cover styles | `public/images/covers/*.jpeg` |
| `npm run workflow:covergen -- file.json --style=moderate` | Generate single style | `public/images/covers/*.jpeg` |
| `npm run publish` | Interactive publish CLI | Article `.md` file |

### Developer
```bash
node agents/developer/setup.js "Build feature X"   # Generate implementation plan
npm run developer:push-docs                         # Push documentation
```

## Orchestrator (Multi-Agent)

```bash
node agents/shared/orchestrator.js "Complex task description"
# Coordinates multiple agents automatically
# Triggers chief-executive for: evaluate, mp, resignation, accountability
# Triggers editor for: article, research, write
# Triggers developer for: website, build, implement, feature
```

## File Locations

| Type | Location |
|------|----------|
| Articles (JSON) | `content/articles/*.json` |
| Articles (MD) | `content/articles/*.md` |
| Research | `content/drafts/*.md` |
| MP Evaluations | `content/evaluations/*-evaluation.json` |
| Annual Reports | `content/evaluations/*-annual-report.json` |
| Action Documents | `content/actions/*.json` |
| Investigations | `content/investigations/*.json` |
| Logs | `agents/workflow/log-*.json` |
| Chart Data | `public/data/*-charts.json` |
| Cover Images | `public/images/covers/*-[style].jpeg` |
| Thumbnails | `public/images/thumbnails/*-[style].jpg` |

## Check Results

```bash
ls -lt content/articles/        # List articles
ls -lt content/evaluations/     # List MP evaluations
ls -lt content/actions/         # List action documents
ls -lt content/investigations/  # List investigations
cat agents/workflow/log-*.json  # View workflow logs
```

## Troubleshooting

```bash
# Check API key
grep ANTHROPIC .env

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
npm run editor:write -- "Canadian budget 2026 analysis"
```

### Research Then Write
```bash
npm run editor:research
# Review output, choose topic
npm run editor:write -- "Chosen topic from research"
```

### Publish Article
```bash
npm run workflow:publish -- content/articles/2026-02-28-article.json
```

### Investigate a Topic
```bash
npm run journalist:investigate -- "Government spending on infrastructure"
```

### Evaluate an MP
```bash
npm run executive:evaluate -- "MP Name"
# Review content/evaluations/ for the report
```

### Take Action Against an MP
```bash
# After evaluation reveals poor performance
npm run executive:action -- "MP Name" --type=letter
npm run executive:action -- "MP Name" --type=resignation_demand "Based on housing failures"
```

### Full Accountability Pipeline
```bash
npm run journalist:investigate -- "MP voting record on housing"
npm run executive:evaluate -- "MP Name"
npm run executive:action -- "MP Name" --type=letter
```

### Generate Annual Report
```bash
npm run executive:annual-report -- 2025
```

## Time Estimates

- Research: 30-90 seconds
- Write article: 60-180 seconds
- Investigation: 2-4 minutes
- MP evaluation: 1-3 minutes
- Action document: 1-2 minutes
- Annual report: 2-5 minutes
- Full daily cycle: 2-4 minutes
- Publish: <5 seconds

## Next Steps

1. Test: `npm run workflow:daily`
2. Review output in `content/`
3. Evaluate an MP: `npm run executive:evaluate -- "MP Name"`
4. Build website with Developer Agent
5. Set up automation with Scheduler
6. Deploy to Vercel/Netlify

---

**Emergency Command**: If stuck, run `npm run editor:research` to test basic functionality.
