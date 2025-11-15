import fs from 'fs/promises';
import path from 'path';
import { generateChartImages } from '../shared/chart-generator.js';

/**
 * Publishing Workflow
 * Converts article JSON to markdown and prepares for publishing
 */
async function publishArticle(articleJsonPath) {
  console.log('📰 Publishing Article\n');

  // Read article JSON
  const articleData = JSON.parse(await fs.readFile(articleJsonPath, 'utf-8'));

  // Generate markdown frontmatter
  const frontmatter = `---
title: "${articleData.title || 'Untitled'}"
date: ${articleData.date || new Date().toISOString().split('T')[0]}
category: ${articleData.category || 'general'}
author: ${articleData.author || 'stopbleeding.ca Editorial Team'}
tags: [${(articleData.tags || []).map((t) => `"${t}"`).join(', ')}]
description: "${articleData.seo?.metaDescription || articleData.summary || ''}"
---

`;

  // Generate article slug for file naming
  const articleSlug = (articleData.title || 'article')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 60);

  // Generate chart images if charts exist
  let chartImagePaths = [];
  if (articleData.charts && articleData.charts.length > 0) {
    console.log(
      `📊 Generating ${articleData.charts.length} chart image(s)...\n`,
    );

    const baseImagePath = path.join(
      process.cwd(),
      'public/images/charts',
      `${articleData.date}-${articleSlug}`,
    );

    try {
      chartImagePaths = await generateChartImages(
        articleData.charts,
        baseImagePath,
      );
    } catch (error) {
      console.error(`Error generating chart images: ${error.message}`);
    }

    // Also save chart data as JSON for reference
    const chartDataPath = path.join(
      process.cwd(),
      'public/data',
      `${articleData.date}-${articleSlug}-charts.json`,
    );
    await fs.mkdir(path.dirname(chartDataPath), { recursive: true });
    await fs.writeFile(
      chartDataPath,
      JSON.stringify(articleData.charts, null, 2),
    );
    console.log(`📊 Chart data saved to: ${chartDataPath}`);
  }

  // Build full markdown content
  let markdown = frontmatter;
  markdown += `# ${articleData.title}\n\n`;
  if (articleData.summary) {
    markdown += `*${articleData.summary}*\n\n`;
  }
  markdown += `---\n\n`;
  markdown += articleData.content || '';

  // Insert chart images into markdown
  if (chartImagePaths.length > 0) {
    markdown += `\n\n---\n\n## Data Visualizations\n\n`;
    chartImagePaths.forEach((imagePath, idx) => {
      const relativePath = imagePath.replace(
        path.join(process.cwd(), 'public'),
        '',
      );
      const chart = articleData.charts[idx];
      markdown += `### ${chart.title}\n\n`;
      markdown += `![${chart.title}](${relativePath})\n\n`;
    });
  }

  // Add sources section
  markdown += `\n---\n\n`;
  markdown += `## Sources\n\n`;

  if (articleData.sources && articleData.sources.length > 0) {
    articleData.sources.forEach((source, idx) => {
      markdown += `${idx + 1}. [${source.title}](${source.url})\n`;
    });
  }

  // Save as markdown
  const outputPath = path.join(
    process.cwd(),
    'content/pages',
    `${articleData.date}-${articleSlug}.md`,
  );

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, markdown);

  console.log(`✅ Article published to: ${outputPath}`);

  return outputPath;
}

// CLI execution
const articlePath = process.argv[2];
if (!articlePath) {
  console.error('Usage: npm run workflow:publish -- path/to/article.json');
  process.exit(1);
}

publishArticle(articlePath).catch(console.error);

export { publishArticle };
