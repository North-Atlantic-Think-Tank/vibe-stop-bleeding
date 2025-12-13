import rss from '@astrojs/rss';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { normalizeArticle } from '../utils/article-normalizer.ts';

async function getArticles() {
  try {
    const articlesDir = join(process.cwd(), 'content/articles');
    const files = await readdir(articlesDir);

    const articles = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const filePath = join(articlesDir, file);
          const content = await readFile(filePath, 'utf-8');
          const rawArticle = JSON.parse(content);

          // Normalize article schema for investigation articles
          const article = normalizeArticle(rawArticle);

          return {
            ...article,
            slug: file.replace('.json', ''),
          };
        })
    );

    // Sort by date, newest first
    return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
}

export async function GET(context) {
  const articles = await getArticles();

  return rss({
    title: 'stopbleeding.ca - Canadian News Analysis',
    description: 'AI-powered analysis of Canadian politics, economy, employment, education, and international affairs',
    site: context.site,
    items: articles.map((article) => ({
      title: article.title,
      pubDate: new Date(article.date),
      description: article.summary || article.content?.split('\n\n')[0]?.substring(0, 200) + '...',
      link: `/articles/${article.slug}/`,
      categories: [article.category],
      author: article.author || 'stopbleeding.ca Editorial Team',
    })),
    customData: `<language>en-ca</language>`,
  });
}
