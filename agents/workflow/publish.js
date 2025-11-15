import fs from 'fs/promises';
import path from 'path';

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
tags: [${(articleData.tags || []).map(t => `"${t}"`).join(', ')}]
description: "${articleData.seo?.metaDescription || articleData.summary || ''}"
---

`;

  // Build full markdown content
  let markdown = frontmatter;
  markdown += `# ${articleData.title}\n\n`;
  markdown += `*${articleData.summary}*\n\n`;
  markdown += `---\n\n`;
  markdown += articleData.content || '';
  markdown += `\n\n---\n\n`;
  markdown += `## Sources\n\n`;

  if (articleData.sources && articleData.sources.length > 0) {
    articleData.sources.forEach((source, idx) => {
      markdown += `${idx + 1}. [${source.title}](${source.url})\n`;
    });
  }

  // Save as markdown
  const articleSlug = (articleData.title || 'article')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 60);

  const outputPath = path.join(
    process.cwd(),
    'content/articles',
    `${articleData.date}-${articleSlug}.md`
  );

  await fs.writeFile(outputPath, markdown);

  // Save chart data separately if exists
  if (articleData.charts && articleData.charts.length > 0) {
    const chartDataPath = path.join(
      process.cwd(),
      'public/data',
      `${articleData.date}-${articleSlug}-charts.json`
    );
    await fs.writeFile(
      chartDataPath,
      JSON.stringify(articleData.charts, null, 2)
    );
    console.log(`📊 Chart data saved to: ${chartDataPath}`);
  }

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
