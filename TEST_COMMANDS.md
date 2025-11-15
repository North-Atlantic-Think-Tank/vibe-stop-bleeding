# Test Commands

Quick reference for testing the AI agent team.

## Setup

```bash
# Install dependencies
npm install

# Configure API key
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-...
```

## Test Individual Agents

### 1. Test Editor Research
```bash
npm run editor:research
```

**Expected output**:
- File created: `content/drafts/research-YYYY-MM-DD.md`
- Contains 5 article ideas
- Each idea has rationale and topic description

### 2. Test Editor Writing
```bash
npm run editor:write -- "Canadian inflation trends December 2024"
```

**Expected output**:
- File created: `content/articles/YYYY-MM-DD-canadian-inflation-trends-december-2024.json`
- Contains structured article data
- Has title, content, sources, charts

### 3. Test Developer
```bash
node agents/developer/setup.js "Create a homepage for stopbleeding.ca with article grid"
```

**Expected output**:
- File created: `agents/developer/plan-YYYY-MM-DD-*.md`
- Contains implementation plan
- Has code examples and architecture

### 4. Test Publisher
```bash
# First create an article, then:
npm run workflow:publish -- content/articles/YYYY-MM-DD-your-article.json
```

**Expected output**:
- Markdown file created in `content/articles/`
- Chart data saved to `public/data/` (if charts exist)

## Test Workflows

### 5. Test Full Daily Cycle
```bash
npm run workflow:daily
```

**Expected output**:
- Research file in `content/drafts/`
- Article JSON in `content/articles/`
- Log file in `agents/workflow/`

**Duration**: ~2-3 minutes (depends on API)

### 6. Test Orchestrator
```bash
node agents/shared/orchestrator.js "Research Canadian housing market and write article with price trend analysis"
```

**Expected output**:
- Orchestration log in `agents/workflow/`
- Contains outputs from multiple agents
- Shows coordination between agents

## Verify Outputs

### Check Research Output
```bash
cat content/drafts/research-*.md
```

Should contain:
- Multiple article ideas
- Canadian focus
- Recent/trending topics

### Check Article JSON
```bash
cat content/articles/*.json | head -50
```

Should have:
- Valid JSON structure
- Required fields (title, date, category, content)
- Sources array
- SEO metadata

### Check Markdown Output
```bash
cat content/articles/*.md | head -50
```

Should have:
- Frontmatter with metadata
- Formatted content
- Source links

### Check Logs
```bash
cat agents/workflow/log-*.json
```

Should have:
- Timestamp
- Completion status
- Task details

## Test Data Utilities

### Test JSON to Markdown Conversion
```bash
node -e "
import { jsonToMarkdown } from './agents/shared/data-converter.js';
jsonToMarkdown('content/articles/your-article.json', 'test-output.md');
"
```

### Test Article Validation
```bash
node -e "
import { validateArticle } from './agents/shared/types.js';
import fs from 'fs';
const article = JSON.parse(fs.readFileSync('content/articles/your-article.json'));
console.log('Valid:', validateArticle(article));
"
```

## Troubleshooting

### If Agent Doesn't Respond

1. **Check API Key**:
```bash
cat .env | grep ANTHROPIC_API_KEY
```

2. **Test API Connection**:
```bash
node -e "
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
console.log('API key loaded:', !!client.apiKey);
"
```

3. **Check Node Version**:
```bash
node --version  # Should be 18+
```

### If JSON Parsing Fails

```bash
# Manually inspect output
cat content/articles/your-article.json

# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('content/articles/your-article.json', 'utf-8'))"
```

### If File Not Created

```bash
# Check directory exists
ls -la content/articles/
ls -la content/drafts/

# Check permissions
ls -ld content/
```

## Performance Tests

### Measure Research Time
```bash
time npm run editor:research
```

**Expected**: 30-90 seconds

### Measure Writing Time
```bash
time npm run editor:write -- "Test article topic"
```

**Expected**: 60-180 seconds

### Measure Full Cycle
```bash
time npm run workflow:daily
```

**Expected**: 2-4 minutes

## Integration Tests

### Test Complete Pipeline
```bash
# Step 1: Research
npm run editor:research

# Step 2: Extract topic and write
TOPIC="Your chosen topic from research"
npm run editor:write -- "$TOPIC"

# Step 3: Find the article
ARTICLE=$(ls -t content/articles/*.json | head -1)

# Step 4: Publish
npm run workflow:publish -- "$ARTICLE"

# Step 5: Verify
ls -l content/articles/*.md
```

## Mock Test (No API Calls)

For testing without API calls, create mock data:

```bash
# Create mock article
cat > content/articles/2025-11-14-test-article.json << 'EOF'
{
  "title": "Test Article",
  "category": "politics",
  "date": "2025-11-14",
  "author": "Test Author",
  "summary": "Test summary",
  "content": "# Test Content\n\nThis is test content.",
  "charts": [],
  "sources": [
    {"title": "Test Source", "url": "https://example.com"}
  ],
  "tags": ["test"],
  "seo": {
    "metaDescription": "Test description",
    "keywords": ["test"]
  }
}
EOF

# Test publishing
npm run workflow:publish -- content/articles/2025-11-14-test-article.json

# Verify
cat content/articles/2025-11-14-test-article.md
```

## Continuous Testing

### Watch for Changes
```bash
# Run tests when files change (requires nodemon)
npm install -g nodemon

nodemon --watch agents --exec "npm run workflow:daily"
```

### Scheduled Testing
```bash
# Add to crontab for daily test
0 9 * * * cd /path/to/project && npm run workflow:daily >> logs/test.log 2>&1
```

## Success Criteria

✅ **Research Test Passes If**:
- File created in correct location
- Contains multiple topic suggestions
- Topics are relevant to Canadian news

✅ **Writing Test Passes If**:
- Valid JSON created
- All required fields present
- Content is 800-1500 words
- Sources cited

✅ **Publishing Test Passes If**:
- Markdown file created
- Frontmatter formatted correctly
- Content rendered properly

✅ **Workflow Test Passes If**:
- All steps complete without errors
- Files created in correct locations
- Log file shows success

## Common Test Scenarios

### Scenario 1: First Time Setup
```bash
npm install
cp .env.example .env
# Add API key to .env
npm run editor:research
```

### Scenario 2: Daily Content Generation
```bash
npm run workflow:daily
```

### Scenario 3: Custom Article
```bash
npm run editor:write -- "Your specific topic"
```

### Scenario 4: Bulk Publishing
```bash
for file in content/articles/*.json; do
  npm run workflow:publish -- "$file"
done
```

## Error Codes

- **Exit 0**: Success
- **Exit 1**: General error (check logs)
- **API Error**: Check API key and network
- **JSON Parse Error**: Check article format
- **File Not Found**: Check paths

## Next Steps After Tests Pass

1. ✅ All agents working
2. → Build website (Developer Agent)
3. → Set up automation (Scheduler)
4. → Deploy to production (Vercel/Netlify)
5. → Monitor and iterate

---

**Quick Test**: `npm run workflow:daily` - If this completes successfully, your agent team is fully operational!
