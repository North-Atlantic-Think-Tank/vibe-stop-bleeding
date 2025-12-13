/**
 * Normalizes article data from different JSON schemas.
 * Handles both regular articles and investigation articles.
 */

export interface NormalizedArticle {
  title: string;
  date: string;
  category: string;
  content: string;
  [key: string]: any;
}

/**
 * Normalizes article schema to handle both regular and investigation articles.
 *
 * Investigation articles have:
 * - investigation_id instead of standard id
 * - article field instead of content
 * - start_date instead of date
 * - No category field (defaults to 'politics')
 *
 * @param article - Raw article data from JSON file
 * @returns Normalized article with consistent schema
 */
export function normalizeArticle(article: any): NormalizedArticle {
  // Check if this is an investigation article (has investigation_id or article field)
  const isInvestigation = article.investigation_id || article.article;

  if (isInvestigation) {
    // Normalize investigation article to standard schema
    const content = article.article || article.content || '';
    return {
      ...article,
      // Use start_date for investigations, fallback to date
      date: article.date || article.start_date,
      // Investigation articles use 'article' field for content
      content: content,
      // Default category for investigations is 'politics' (most investigations are political)
      category: article.category || 'politics',
    };
  }

  // Ensure regular articles have required fields with defaults
  return {
    ...article,
    date: article.date || new Date().toISOString().split('T')[0],
    category: article.category || 'general',
    content: article.content || '',
  };
}
