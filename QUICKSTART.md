# Quick Start Guide

Get your AI agent team running in 5 minutes.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure API Key

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Step 3: Test the Editor Agent

Research trending topics:
```bash
npm run editor:research
```

Check the output in `content/drafts/`

## Step 4: Write Your First Article

```bash
npm run editor:write -- "Latest Canadian employment data analysis"
```

Check the output in `content/articles/`

## Step 5: Run Full Daily Cycle

```bash
npm run workflow:daily
```

This will:
1. Research topics
2. Select top story
3. Write full article
4. Save results

## What You Get

- **JSON articles** with structured data in `content/articles/`
- **Research notes** in `content/drafts/`
- **Workflow logs** in `agents/workflow/`

## Common Commands

```bash
# Research specific category
npm run editor:research politics

# Write article on custom topic
npm run editor:write -- "Your topic here"

# Publish article to markdown
npm run workflow:publish -- content/articles/YYYY-MM-DD-article.json

# Complex multi-agent task
node agents/shared/orchestrator.js "Your complex task description"
```

## Next Steps

1. Review the generated content
2. Customize agent prompts in `agents/*/prompt.md`
3. Build the website (use Developer Agent)
4. Set up automated scheduling

See [README.md](./README.md) for full documentation.
