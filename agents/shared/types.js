/**
 * Type definitions and schemas for stopbleeding.ca agent system
 */

/**
 * Article data structure
 * @typedef {Object} Article
 * @property {string} title - Article title
 * @property {string} category - Category (politics|economy|employment|education)
 * @property {string} date - Publication date (YYYY-MM-DD)
 * @property {string} author - Author name
 * @property {string} summary - Brief summary
 * @property {string} content - Full markdown content
 * @property {ChartData[]} charts - Chart data array
 * @property {Source[]} sources - Source references
 * @property {string[]} tags - Article tags
 * @property {SEOData} seo - SEO metadata
 */

/**
 * Chart data structure
 * @typedef {Object} ChartData
 * @property {string} type - Chart type (line|bar|pie|area)
 * @property {string} title - Chart title
 * @property {Object[]} data - Chart data points
 * @property {Object} config - Chart configuration
 */

/**
 * Source reference
 * @typedef {Object} Source
 * @property {string} title - Source title
 * @property {string} url - Source URL
 */

/**
 * SEO metadata
 * @typedef {Object} SEOData
 * @property {string} metaDescription - Meta description
 * @property {string[]} keywords - SEO keywords
 */

/**
 * Validates article data against schema
 */
export function validateArticle(data) {
  const required = ['title', 'category', 'date', 'content'];
  const missing = required.filter(field => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  const validCategories = ['politics', 'economy', 'employment', 'education', 'general'];
  if (!validCategories.includes(data.category)) {
    throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throw new Error('Invalid date format. Must be YYYY-MM-DD');
  }

  return true;
}

/**
 * Creates article template
 */
export function createArticleTemplate() {
  return {
    title: '',
    category: 'general',
    date: new Date().toISOString().split('T')[0],
    author: 'stopbleeding.ca Editorial Team',
    summary: '',
    content: '',
    charts: [],
    sources: [],
    tags: [],
    seo: {
      metaDescription: '',
      keywords: [],
    },
  };
}

export default {
  validateArticle,
  createArticleTemplate,
};
