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

Articles are stored as JSON files in `content/articles/` following this schema:

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

Output in `dist/` directory is ready for deployment to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

### Environment Variables

Required for full functionality:
- `ANTHROPIC_API_KEY` - For AI agent article generation

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Future Enhancements

- RSS feed generation
- Search functionality
- Newsletter subscription
- Social media integration
- Comment system
- Analytics dashboard
