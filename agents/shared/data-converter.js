import fs from 'fs/promises';
import path from 'path';
import { validateArticle } from './types.js';
import { generateChartImages } from './chart-generator.js';

/**
 * Data Converter Utilities
 * Handles conversion between different data formats
 */

/**
 * Converts article JSON to markdown
 */
export async function jsonToMarkdown(jsonPath, outputPath = null, generateCharts = false) {
  const data = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
  validateArticle(data);

  const frontmatter = `---
title: "${data.title}"
date: ${data.date}
category: ${data.category}
author: ${data.author}
tags: [${data.tags.map(t => `"${t}"`).join(', ')}]
description: "${data.seo?.metaDescription || data.summary}"
---

`;

  // Generate chart images if requested
  let chartImagePaths = [];
  if (generateCharts && data.charts && data.charts.length > 0 && outputPath) {
    const articleSlug = (data.title || 'article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 60);

    const baseImagePath = path.join(
      path.dirname(outputPath),
      '../public/images/charts',
      `${data.date}-${articleSlug}`
    );

    try {
      chartImagePaths = await generateChartImages(data.charts, baseImagePath);
    } catch (error) {
      console.error(`Error generating chart images: ${error.message}`);
    }
  }

  let markdown = frontmatter;
  markdown += `# ${data.title}\n\n`;
  markdown += `*${data.summary}*\n\n`;
  markdown += `---\n\n`;
  markdown += data.content || '';

  // Insert chart images into markdown
  if (chartImagePaths.length > 0) {
    markdown += `\n\n---\n\n## Data Visualizations\n\n`;
    chartImagePaths.forEach((imagePath, idx) => {
      const relativePath = imagePath.replace(path.join(process.cwd(), 'public'), '');
      const chart = data.charts[idx];
      markdown += `### ${chart.title}\n\n`;
      markdown += `![${chart.title}](${relativePath})\n\n`;
    });
  }

  if (data.sources && data.sources.length > 0) {
    markdown += `\n\n---\n\n## Sources\n\n`;
    data.sources.forEach((source, idx) => {
      markdown += `${idx + 1}. [${source.title}](${source.url})\n`;
    });
  }

  if (outputPath) {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, markdown);
  }

  return markdown;
}

/**
 * Converts markdown to article JSON
 */
export async function markdownToJson(markdownPath, outputPath = null) {
  const content = await fs.readFile(markdownPath, 'utf-8');

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatterMatch) {
    throw new Error('No frontmatter found in markdown file');
  }

  const frontmatter = frontmatterMatch[1];
  const body = content.slice(frontmatterMatch[0].length);

  // Parse frontmatter
  const data = {
    content: body.trim(),
  };

  frontmatter.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes and parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        data[key] = JSON.parse(value.replace(/"/g, '"'));
      } else {
        data[key] = value.replace(/^"(.*)"$/, '$1');
      }
    }
  });

  if (outputPath) {
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
  }

  return data;
}

/**
 * Validates and formats chart data
 */
export function formatChartData(chartData) {
  const validTypes = ['line', 'bar', 'pie', 'area', 'scatter'];

  if (!chartData.type || !validTypes.includes(chartData.type)) {
    throw new Error(`Invalid chart type. Must be one of: ${validTypes.join(', ')}`);
  }

  if (!chartData.data || !Array.isArray(chartData.data)) {
    throw new Error('Chart data must be an array');
  }

  return {
    type: chartData.type,
    title: chartData.title || 'Chart',
    data: chartData.data,
    config: chartData.config || {},
  };
}

/**
 * Generates RSS feed from articles
 */
export async function generateRSSFeed(articlesDir, outputPath) {
  const files = await fs.readdir(articlesDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const articles = await Promise.all(
    jsonFiles.map(async file => {
      const content = await fs.readFile(`${articlesDir}/${file}`, 'utf-8');
      return JSON.parse(content);
    })
  );

  // Sort by date
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>stopbleeding.ca</title>
    <link>https://stopbleeding.ca</link>
    <description>Canadian News Analysis</description>
    <language>en-ca</language>
    <atom:link href="https://stopbleeding.ca/rss.xml" rel="self" type="application/rss+xml" />
    ${articles.map(article => `
    <item>
      <title>${article.title}</title>
      <link>https://stopbleeding.ca/articles/${article.date}-${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</link>
      <description>${article.summary}</description>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <category>${article.category}</category>
    </item>`).join('\n')}
  </channel>
</rss>`;

  await fs.writeFile(outputPath, rss);
  return rss;
}

export default {
  jsonToMarkdown,
  markdownToJson,
  formatChartData,
  generateRSSFeed,
};
