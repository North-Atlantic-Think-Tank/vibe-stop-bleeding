# stopbleeding.ca Website

Canadian news analysis platform built with Astro, React, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ArticleCard.astro
│   │   └── charts/
│   │       └── Chart.tsx (React chart component)
│   ├── layouts/         # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/           # File-based routing
│   │   ├── index.astro  # Homepage
│   │   ├── about.astro  # About page
│   │   ├── articles/
│   │   │   └── [slug].astro  # Dynamic article pages
│   │   └── category/
│   │       └── [category].astro  # Category pages
│   └── styles/
│       └── global.css   # Global styles with Tailwind
├── content/
│   └── articles/        # Article JSON files
├── public/              # Static assets
└── astro.config.mjs     # Astro configuration
```

## 📝 Content Management

### Adding Articles

<<<<<<< HEAD
Articles are stored as JSON files in `content/articles/` following this schema:
=======
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
>>>>>>> main

```json
{
  "title": "Article Title",
  "category": "politics|economy|employment|education|general",
  "date": "YYYY-MM-DD",
  "tags": ["tag1", "tag2"],
  "content": "Article content in paragraphs...",
  "sources": [
    {
      "title": "Source Title",
      "url": "https://example.com",
      "publication": "Publication Name"
    }
  ],
  "charts": [
    {
      "type": "line|bar|pie",
      "title": "Chart Title",
      "data": [...],
      "xKey": "name",
      "yKey": "value"
    }
  ]
}
```

### File Naming Convention

Use format: `YYYY-MM-DD-slug.json`

Example: `2025-01-14-sample-canadian-economy.json`

## 🎨 Design Features

- **Newspaper-style layout**: Classic newspaper masthead and typography
- **Canadian branding**: Red accent color (Canadian red #FF0000)
- **Responsive design**: Mobile-first approach with Tailwind CSS
- **Data visualization**: Interactive charts using Recharts
- **Category filtering**: Dedicated pages for Politics, Economy, Employment, Education
- **SEO optimized**: Meta tags, Open Graph, and sitemap support

## 🔧 Tech Stack

- **Framework**: Astro 4.16
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.3 + Typography plugin
- **Charts**: Recharts 2.10
- **Content**: JSON-based with file system routing
- **Deployment**: Static site (Vercel/Netlify compatible)

## 📊 Chart Types

The website supports three chart types:

1. **Line Chart**: Trends over time (GDP growth, employment rates)
2. **Bar Chart**: Comparisons (sector performance, provincial data)
3. **Pie Chart**: Proportions (budget allocations, demographics)

Charts are rendered using the `Chart.tsx` React component with Recharts.

## 🌐 Pages

- **/** - Homepage with featured and recent articles
- **/category/[category]** - Category-filtered article lists
- **/articles/[slug]** - Individual article pages with charts
- **/about** - About page explaining the platform

## 🚢 Deployment

The site is configured for static deployment:

```bash
npm run build
```

Output in `docs/` directory is ready for deployment to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

