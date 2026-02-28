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

/**
 * MP Evaluation data structure
 * @typedef {Object} Evaluation
 * @property {string} evaluation_id - Unique evaluation identifier
 * @property {string} mp_name - Full name of the MP
 * @property {string} riding - Electoral riding name
 * @property {string} province - Province
 * @property {string} party - Political party
 * @property {string} evaluation_period - Period covered
 * @property {string} date - Evaluation date (YYYY-MM-DD)
 * @property {Object} scores - Scores by criterion (1-10 each)
 * @property {number} overall_score - Weighted average score
 * @property {string} overall_rating - Letter rating (A-F)
 * @property {string} summary - Executive summary
 * @property {Object[]} findings - Detailed findings per criterion
 * @property {string[]} concerns - Key concerns
 * @property {string[]} recommendations - Recommendations
 * @property {string} action_required - Required action type
 * @property {Object[]} sources - Source references
 */

/**
 * Validates MP evaluation data against schema
 */
export function validateEvaluation(data) {
  const required = ['mp_name', 'date', 'scores', 'overall_rating'];
  const missing = required.filter(field => !data[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required evaluation fields: ${missing.join(', ')}`);
  }

  const validRatings = ['A', 'B', 'C', 'D', 'F'];
  if (!validRatings.includes(data.overall_rating)) {
    throw new Error(`Invalid rating. Must be one of: ${validRatings.join(', ')}`);
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throw new Error('Invalid date format. Must be YYYY-MM-DD');
  }

  // Validate scores are 1-10
  if (data.scores && typeof data.scores === 'object') {
    for (const [criterion, score] of Object.entries(data.scores)) {
      if (typeof score !== 'number' || score < 1 || score > 10) {
        throw new Error(`Invalid score for ${criterion}. Must be 1-10`);
      }
    }
  }

  return true;
}

/**
 * Creates MP evaluation template
 */
export function createEvaluationTemplate() {
  return {
    evaluation_id: '',
    mp_name: '',
    riding: '',
    province: '',
    party: '',
    evaluation_period: '',
    date: new Date().toISOString().split('T')[0],
    scores: {
      attendance_participation: 0,
      legislative_effectiveness: 0,
      constituency_service: 0,
      alignment_with_canadian_interests: 0,
      fiscal_responsibility: 0,
      transparency_ethics: 0,
      public_conduct: 0,
      crisis_response: 0,
    },
    overall_score: 0,
    overall_rating: 'C',
    summary: '',
    findings: [],
    notable_actions: [],
    concerns: [],
    recommendations: [],
    action_required: 'none',
    sources: [],
    methodology: '',
  };
}

export default {
  validateArticle,
  createArticleTemplate,
  validateEvaluation,
  createEvaluationTemplate,
};
